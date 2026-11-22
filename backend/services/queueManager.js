import fs from 'fs';
import path from 'path';
import config from '../config/index.js';
import { jobStore } from '../models/jobModel.js';
import { logger } from '../utils/logger.js';
import { ExpressError } from '../utils/ExpressError.js';

class QueueManager {
  constructor() {
    this.queue = [];       // Array of job IDs waiting to be processed
    this.activeJob = null; // Currently running Job object
    this.currentProcessHandle = null; // Callback to kill the active child process
  }

  /**
   * Adds a job to the download queue.
   * Starts processing loop if idle.
   * 
   * @param {Job} job 
   * @returns {number} 1-based queue position (0 if active/processing)
   */
  addJob(job) {
    if (this.queue.includes(job.jobId) || (this.activeJob && this.activeJob.jobId === job.jobId)) {
      throw new ExpressError(409, 'Job is already in the queue or being processed');
    }

    job.update({ status: 'queued' });
    this.queue.push(job.jobId);
    
    const position = this.getQueuePosition(job.jobId);
    logger.info(`[QueueManager] Job ${job.jobId} added to queue. Position: ${position}. Current queue length: ${this.queue.length}`);

    // Trigger processing loop
    process.nextTick(() => this._processNext());

    return position;
  }

  /**
   * Calculates the 1-based queue position of a job.
   * - If the job is currently processing, returns 0.
   * - If the job is waiting in the queue, returns its index + 1.
   * - Otherwise, returns -1.
   * 
   * @param {string} jobId 
   * @returns {number}
   */
  getQueuePosition(jobId) {
    if (this.activeJob && this.activeJob.jobId === jobId) {
      return 0;
    }
    const idx = this.queue.indexOf(jobId);
    if (idx !== -1) {
      return idx + 1;
    }
    return -1;
  }

  /**
   * Cancels a job by ID.
   * If running: kills process, cleans up files.
   * If in queue: removes from queue.
   * Updates state to cancelled.
   * 
   * @param {string} jobId 
   */
  async cancelJob(jobId) {
    const job = jobStore.get(jobId);
    if (!job) {
      throw new ExpressError(404, 'Download job not found');
    }

    logger.info(`[QueueManager] Request to cancel job ${jobId}. Current status: ${job.status}`);

    if (job.status === 'completed') {
      throw new ExpressError(400, 'Cannot cancel a completed download');
    }

    if (this.activeJob && this.activeJob.jobId === jobId) {
      logger.info(`[QueueManager] Killing active process for job ${jobId}`);
      if (this.currentProcessHandle) {
        this.currentProcessHandle('SIGTERM');
      }
      
      job.update({ status: 'cancelled', error: 'Download cancelled by user' });
      this.activeJob = null;
      this.currentProcessHandle = null;

      // Clean up partial files
      this._cleanupPartialDownload(jobId, job.container);
      
      // Start next job
      process.nextTick(() => this._processNext());
    } else {
      const index = this.queue.indexOf(jobId);
      if (index !== -1) {
        this.queue.splice(index, 1);
        job.update({ status: 'cancelled', error: 'Download cancelled by user while in queue' });
        logger.info(`[QueueManager] Job ${jobId} removed from queue. New queue length: ${this.queue.length}`);
      }
    }
  }

  /**
   * Retries a failed or cancelled job.
   * 
   * @param {string} jobId 
   * @returns {number} 1-based queue position
   */
  retryJob(jobId) {
    const job = jobStore.get(jobId);
    if (!job) {
      throw new ExpressError(404, 'Download job not found');
    }

    const allowableStatuses = ['failed', 'cancelled'];
    if (!allowableStatuses.includes(job.status)) {
      throw new ExpressError(
        400,
        `Cannot retry a job in "${job.status}" state. Only failed or cancelled jobs can be retried.`
      );
    }

    logger.info(`[QueueManager] Retrying job ${jobId}. Re-inserting into queue.`);
    
    // Reset progress details
    job.update({
      status: 'queued',
      progress: 0,
      speed: null,
      eta: null,
      downloadedBytes: null,
      totalBytes: null,
      error: null
    });

    this.queue.push(jobId);
    const position = this.getQueuePosition(jobId);

    // Process next
    process.nextTick(() => this._processNext());

    return position;
  }

  /**
   * Queue processing loop. Runs next job in FIFO order.
   */
  async _processNext() {
    if (this.activeJob) {
      return; // A job is already active
    }

    if (this.queue.length === 0) {
      return; // Queue is empty
    }

    const nextJobId = this.queue.shift();
    const job = jobStore.get(nextJobId);

    if (!job) {
      logger.warn(`[QueueManager] Job ${nextJobId} not found in store, skipping.`);
      return this._processNext();
    }

    this.activeJob = job;
    job.update({ status: 'processing' });

    logger.info(`[QueueManager] Starting job ${job.jobId}. Queue length: ${this.queue.length}`);

    // Dynamic import to avoid circular dependencies
    const { default: downloadService } = await import('./download.service.js');

    try {
      await downloadService.executeJobDownload(job, (killFn) => {
        this.currentProcessHandle = killFn;
      });

      this.activeJob = null;
      this.currentProcessHandle = null;

      // Start next job
      process.nextTick(() => this._processNext());
    } catch (error) {
      logger.error(`[QueueManager] Job ${job.jobId} execution failed: ${error.message}`);
      
      if (job.status === 'processing') {
        job.update({
          status: 'failed',
          error: error.message || 'Background execution failed'
        });
      }

      this.activeJob = null;
      this.currentProcessHandle = null;

      // Start next job
      process.nextTick(() => this._processNext());
    }
  }

  /**
   * Cleans up temporary download fragments left by aborted processes.
   */
  _cleanupPartialDownload(jobId, container) {
    const expectedTempPath = path.join(config.downloadDir, `${jobId}.${container}`);
    const expectedPartPath = `${expectedTempPath}.part`;

    const pathsToDelete = [expectedTempPath, expectedPartPath];

    pathsToDelete.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          logger.info(`[QueueManager] Cleaned up aborted download fragment: ${filePath}`);
        } catch (err) {
          logger.warn(`[QueueManager] Failed to clean up fragment ${filePath}: ${err.message}`);
        }
      }
    });
  }
}

export const queueManager = new QueueManager();
export default queueManager;
