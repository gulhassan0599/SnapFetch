import crypto from 'crypto';
import { appEmitter } from '../utils/eventEmitter.js';

const STATUS_EVENT_MAP = {
  processing: 'job:started',
  completed: 'job:completed',
  failed: 'job:failed',
  cancelled: 'job:cancelled'
};

export class Job {
  constructor(jobData = {}) {
    this.jobId = jobData.jobId || crypto.randomBytes(6).toString('hex');
    this.status = jobData.status || 'queued'; // queued, processing, completed, failed, cancelled
    this.progress = jobData.progress || 0;
    this.speed = jobData.speed || null;
    this.eta = jobData.eta || null;
    this.downloadedBytes = jobData.downloadedBytes || null;
    this.totalBytes = jobData.totalBytes || null;
    this.filename = jobData.filename || null;
    this.filepath = jobData.filepath || null;
    this.container = jobData.container || null;
    this.quality = jobData.quality || null;
    this.url = jobData.url || null;
    this.format = jobData.format || null; // video, audio
    
    this.createdAt = jobData.createdAt || new Date();
    this.updatedAt = jobData.updatedAt || new Date();
    this.startedAt = jobData.startedAt || null;
    this.completedAt = jobData.completedAt || null;
    this.error = jobData.error || null;
    this.size = jobData.size || null;

    // Emit event on initial queueing
    if (this.status === 'queued') {
      process.nextTick(() => this._emitEvent('job:queued'));
    }
  }

  _emitEvent(eventName) {
    appEmitter.emit(eventName, {
      jobId: this.jobId,
      status: this.status,
      progress: this.progress,
      speed: this.speed,
      eta: this.eta,
      downloadedBytes: this.downloadedBytes,
      totalBytes: this.totalBytes,
      filename: this.filename,
      filepath: this.filepath,
      error: this.error,
      updatedAt: this.updatedAt
    });
  }

  update(updateFields = {}) {
    const oldStatus = this.status;
    const oldProgress = this.progress;

    Object.assign(this, updateFields);
    this.updatedAt = new Date();

    // Trigger event emitters on state transitions
    if (updateFields.status && updateFields.status !== oldStatus) {
      if (this.status === 'processing') {
        this.startedAt = new Date();
      } else if (['completed', 'failed', 'cancelled'].includes(this.status)) {
        this.completedAt = new Date();
      }

      const eventName = STATUS_EVENT_MAP[this.status];
      if (eventName) {
        this._emitEvent(eventName);
      }
    } else if (updateFields.progress !== undefined && updateFields.progress !== oldProgress) {
      this._emitEvent('job:progress');
    }
  }

  // Safe client-facing representation
  toJSON() {
    return {
      jobId: this.jobId,
      status: this.status,
      progress: this.progress,
      speed: this.speed,
      eta: this.eta,
      filename: this.filename,
      size: this.size,
      error: this.error,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Global in-memory job store
export const jobStore = new Map();

export default Job;
