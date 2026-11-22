import fs from 'fs';
import path from 'path';
import config from '../config/index.js';
import { spawnProcess } from '../utils/processHelpers.js';
import { parseProgressLine } from '../utils/progressParser.js';
import mediaService from './media.service.js';
import { Job, jobStore } from '../models/jobModel.js';
import { sanitizeFilename, formatBytes } from '../utils/fileHelpers.js';
import { logger } from '../utils/logger.js';
import queueManager from './queueManager.js';

export const downloadService = {
  /**
   * Starts a download job by adding it to the queue manager.
   * 
   * @param {object} params Download parameters: { url, format, quality, container }
   * @returns {Promise<Job>} Immediately returns the queued Job model.
   */
  async startDownloadJob({ url, format, quality, container, title = null }) {
    // Create new job model in memory
    const job = new Job({
      url,
      format,
      quality,
      container,
      filename: title,
      status: 'queued'
    });
    
    jobStore.set(job.jobId, job);
    
    // Add to queue manager singleton
    queueManager.addJob(job);
    
    return job;
  },

  /**
   * Executes the actual download for a job.
   * Spawns yt-dlp, streams stdout, parses progress in real-time,
   * renames final output, and handles errors.
   * 
   * @param {Job} job The job object to execute.
   * @param {Function} registerKillFn Callback to register the process kill handle.
   */
  async executeJobDownload(job, registerKillFn) {
    const jobId = job.jobId;
    const startTime = process.hrtime();
    logger.info(`[DownloadService] [Job ${jobId}] Executing background download for ${job.url}`);

    try {
      // 1. Fetch metadata only if title was not already provided by caller
      let title = job.filename;
      if (!title) {
        const metadata = await mediaService.getMetadata(job.url);
        title = metadata.title || 'download';
      }
      
      // Determine final sanitized filename
      const finalFilename = sanitizeFilename(title, job.container);
      const finalFilepath = path.join(config.downloadDir, finalFilename);

      logger.info(`[DownloadService] [Job ${jobId}] Target title: "${title}". Final filename: "${finalFilename}"`);

      // 2. Prepare yt-dlp arguments
      const tempOutputPattern = path.join(config.downloadDir, `${jobId}.%(ext)s`);
      const args = [
        '--newline' // Force progress on newlines to parse easily
      ];

      if (job.format === 'video') {
        let height = job.quality ? job.quality.toLowerCase().replace('p', '') : '1080';
        if (height === '4k') height = '2160';
        if (height === '2k') height = '1440';
        args.push(
          '-f', `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]`,
          '--merge-output-format', job.container.toLowerCase(),
          '-o', tempOutputPattern
        );
      } else {
        // Audio extraction
        args.push(
          '-x',
          '--audio-format', 'mp3',
          '--audio-quality', '0',
          '-o', tempOutputPattern
        );
      }

      // Configure custom ffmpeg path if it exists
      if (config.ffmpegPath && config.ffmpegPath !== 'ffmpeg') {
        args.push('--ffmpeg-location', config.ffmpegPath);
      }

      args.push(job.url);

      // 3. Spawn process
      logger.info(`[DownloadService] [Job ${jobId}] Spawning yt-dlp: ${config.ytDlpPath} ${args.join(' ')}`);
      
      const { promise, child, kill } = spawnProcess(config.ytDlpPath, args, { timeout: 300000 });
      
      // Register kill handle with queue manager so it can be terminated
      registerKillFn(kill);

      // Hook onto stdout stream for real-time progress parsing
      let stdoutBuffer = '';
      let downloadPhase = 1; // 1 = video stream (0-75%), 2 = audio stream (75-95%), 3 = ffmpeg merge (95-100%)
      let lastRawProgress = 0;
      let totalVideoSeconds = 0;
      let audioEstimatedSeconds = 0;

      child.stdout.on('data', (data) => {
        stdoutBuffer += data.toString();
        
        // Parse lines
        let lineEndIndex;
        while ((lineEndIndex = stdoutBuffer.indexOf('\n')) !== -1) {
          const line = stdoutBuffer.substring(0, lineEndIndex).trim();
          stdoutBuffer = stdoutBuffer.substring(lineEndIndex + 1);

          if (line) {
            // Check if ffmpeg post-processing / merge started
            if (line.includes('[Merger]') || line.includes('[ExtractAudio]') || line.includes('[Fixup')) {
              downloadPhase = 3;
              job.update({
                progress: 96,
                speed: 'Merging streams...',
                eta: '00:03'
              });
              continue;
            }

            const progressStats = parseProgressLine(line);
            if (progressStats) {
              const rawProgress = progressStats.progress;

              // Parse raw ETA string to numeric seconds
              let rawSeconds = 0;
              if (progressStats.eta && progressStats.eta.includes(':')) {
                const parts = progressStats.eta.split(':').map(Number);
                if (parts.length === 2) {
                  rawSeconds = parts[0] * 60 + parts[1];
                } else if (parts.length === 3) {
                  rawSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                }
              }

              // Detect transition from Video (Phase 1) to Audio (Phase 2)
              if (job.format === 'video' && downloadPhase === 1 && rawProgress < 20 && lastRawProgress > 70) {
                downloadPhase = 2;
              }
              lastRawProgress = rawProgress;

              let scaledProgress = rawProgress;
              let scaledEta = progressStats.eta;

              if (job.format === 'video') {
                if (downloadPhase === 1) {
                  // Phase 1: Video (0% -> 75%)
                  scaledProgress = Math.min(Math.round((rawProgress / 100) * 75), 75);

                  // Extrapolate audio track duration based on initial video rate (~35% of video time)
                  if (rawProgress > 5 && rawProgress < 50 && rawSeconds > 0) {
                    const extrapolatedTotalVideo = (rawSeconds / (100 - rawProgress)) * 100;
                    totalVideoSeconds = Math.max(totalVideoSeconds, extrapolatedTotalVideo);
                    audioEstimatedSeconds = Math.round(totalVideoSeconds * 0.35);
                  }

                  // Total Remaining = (Remaining Video Seconds) + (Audio Duration) + (2s Merge)
                  const remainingAudio = audioEstimatedSeconds > 0 ? audioEstimatedSeconds : Math.round(rawSeconds * 0.4);
                  const totalRemainingSeconds = rawSeconds + remainingAudio + 2;

                  const m = Math.floor(totalRemainingSeconds / 60);
                  const s = totalRemainingSeconds % 60;
                  scaledEta = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

                } else if (downloadPhase === 2) {
                  // Phase 2: Audio (75% -> 95%)
                  scaledProgress = Math.min(75 + Math.round((rawProgress / 100) * 20), 95);

                  // Remaining Audio Seconds + 2s FFmpeg merge
                  const totalRemainingSeconds = Math.max(rawSeconds + 2, 1);
                  const m = Math.floor(totalRemainingSeconds / 60);
                  const s = totalRemainingSeconds % 60;
                  scaledEta = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

                } else {
                  // Phase 3: Merging (95% -> 100%)
                  scaledProgress = 98;
                  scaledEta = '00:02';
                }
              }

              // Update job model in real-time (triggers events)
              job.update({
                progress: scaledProgress,
                speed: progressStats.speed,
                eta: scaledEta,
                downloadedBytes: progressStats.downloadedBytes,
                totalBytes: progressStats.totalBytes
              });

              // Log progress milestones (every ~20% to avoid log spam)
              if (Math.round(scaledProgress) % 20 === 0) {
                logger.info(`[DownloadService] [Job ${jobId}] Progress: ${scaledProgress}% | Phase: ${downloadPhase} | Speed: ${progressStats.speed} | ETA: ${progressStats.eta}`);
              }
            }
          }
        }
      });

      // 4. Await process completion
      await promise;

      // 5. Find the downloaded temp file
      const expectedTempPath = path.join(config.downloadDir, `${jobId}.${job.container}`);
      
      if (!fs.existsSync(expectedTempPath)) {
        throw new Error(`Download file was not found at expected path: ${expectedTempPath}`);
      }

      // 6. Avoid overwriting existing files
      let destinationPath = finalFilepath;
      let finalUniqueName = finalFilename;
      if (fs.existsSync(finalFilepath)) {
        const parsed = path.parse(finalFilepath);
        const uniqueSuffix = `_${Math.random().toString(36).substring(2, 6)}`;
        finalUniqueName = sanitizeFilename(`${parsed.name}${uniqueSuffix}`, job.container);
        destinationPath = path.join(config.downloadDir, finalUniqueName);
      }

      // 7. Rename temp file to final location
      fs.renameSync(expectedTempPath, destinationPath);

      // Get file size
      const stats = fs.statSync(destinationPath);
      const formattedSize = formatBytes(stats.size);

      const endTime = process.hrtime(startTime);
      const durationMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
      logger.info(`[DownloadService] [Job ${jobId}] Complete. Size: ${formattedSize}. Duration: ${durationMs}ms`);

      // Update job to completed
      job.update({
        status: 'completed',
        filename: finalUniqueName,
        filepath: destinationPath,
        size: formattedSize,
        progress: 100
      });

      // Schedule permanent file deletion exactly 5 minutes (300,000 ms) after completion
      setTimeout(() => {
        if (destinationPath && fs.existsSync(destinationPath)) {
          try {
            fs.unlinkSync(destinationPath);
            logger.info(`[DownloadService] Auto-expired and permanently deleted: ${destinationPath}`);
          } catch (delErr) {
            logger.warn(`[DownloadService] Failed to auto-delete ${destinationPath}: ${delErr.message}`);
          }
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      if (job.status === 'cancelled') {
        logger.info(`[DownloadService] [Job ${jobId}] Job was cancelled by user. Terminating execute flow.`);
        return;
      }

      const endTime = process.hrtime(startTime);
      const durationMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
      logger.error(`[DownloadService] [Job ${jobId}] Failed. Duration: ${durationMs}ms. Error: ${error.message}`);
      
      // Clean up temp file
      const expectedTempPath = path.join(config.downloadDir, `${jobId}.${job.container}`);
      if (fs.existsSync(expectedTempPath)) {
        try {
          fs.unlinkSync(expectedTempPath);
        } catch (unlinkErr) {
          logger.warn(`[DownloadService] Failed to clean up temp file ${expectedTempPath}: ${unlinkErr.message}`);
        }
      }

      job.update({
        status: 'failed',
        error: error.message || 'Download failed due to execution error'
      });

      throw error;
    }
  }
};

export default downloadService;
