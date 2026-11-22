import fs from 'fs';
import config from './config/index.js';
import app from './app.js';
import { logger } from './utils/logger.js';
import { ytDlpService, ffmpegService } from './services/binaryService.js';
import { cleanupExpiredFiles } from './utils/fileHelpers.js';
import { jobStore } from './models/jobModel.js';

// Pre-flight check: ensure required storage directories and binaries exist
const validateStartup = async () => {
  // Ensure storage download directory exists
  if (!fs.existsSync(config.downloadDir)) {
    fs.mkdirSync(config.downloadDir, { recursive: true });
  }

  // Verify yt-dlp binary and check for updates
  try {
    const ytDlpVersion = await ytDlpService.getVersion();
    logger.info(`✓ Storage directories ready | yt-dlp version: ${ytDlpVersion}`);

    // Asynchronously check for yt-dlp update in background without blocking server startup
    ytDlpService.update()
      .then((updateMsg) => {
        logger.info(`[yt-dlp auto-updater] ${updateMsg.replace(/[\r\n]+/g, ' ')}`);
      })
      .catch((updateErr) => {
        logger.warn(`[yt-dlp auto-updater] Check skipped: ${updateErr.message}`);
      });
  } catch (error) {
    logger.error(`yt-dlp verification failed: ${error.message}`);
    process.exit(1);
  }

  // Verify FFmpeg binary (optional / warning only)
  try {
    const ffmpegVersion = await ffmpegService.getVersion();
    logger.info(`✓ FFmpeg version: ${ffmpegVersion}`);
  } catch (error) {
    logger.warn(`FFmpeg not found or unusable: ${error.message} (Proceeding without FFmpeg)`);
  }
};

const startServer = async () => {
  await validateStartup();

  // Periodic automatic cleanup every 2 minutes: clean files older than 5 minutes
  setInterval(() => {
    cleanupExpiredFiles(config.downloadDir, 5 * 60 * 1000);

    // Purge completed/failed in-memory job records older than 5 minutes
    const now = Date.now();
    for (const [id, job] of jobStore.entries()) {
      if (['completed', 'failed', 'cancelled'].includes(job.status)) {
        const age = now - new Date(job.updatedAt || job.createdAt).getTime();
        if (age > 5 * 60 * 1000) {
          jobStore.delete(id);
        }
      }
    }
  }, 2 * 60 * 1000);

  // Periodic automatic yt-dlp update check every 24 hours
  setInterval(() => {
    ytDlpService.update()
      .then((updateMsg) => {
        logger.info(`[yt-dlp auto-updater] Daily check: ${updateMsg.replace(/[\r\n]+/g, ' ')}`);
      })
      .catch((err) => {
        logger.warn(`[yt-dlp auto-updater] Daily check failed: ${err.message}`);
      });
  }, 24 * 60 * 60 * 1000);

  const server = app.listen(config.port, () => {
    logger.info(`[SnapFetch Server] Running in ${config.nodeEnv} mode on port ${config.port}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection Error: ${err.message}`, err);
    server.close(() => {
      logger.info('Server closed due to unhandled promise rejection');
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception Error: ${err.message}`, err);
    server.close(() => {
      logger.info('Server closed due to uncaught exception');
      process.exit(1);
    });
  });
};

startServer();
