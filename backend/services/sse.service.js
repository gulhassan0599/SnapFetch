import { appEmitter } from '../utils/eventEmitter.js';
import { jobStore } from '../models/jobModel.js';
import { logger } from '../utils/logger.js';
import { ExpressError } from '../utils/ExpressError.js';
import queueManager from './queueManager.js';

class SSEService {
  constructor() {
    this.clients = new Map(); // jobId -> Set of Express response objects
    this.heartbeatInterval = null;
    this._initEventListeners();
    this._startHeartbeat();
  }

  /**
   * Registers a client connection for Server-Sent Events on a specific jobId.
   * 
   * @param {string} jobId 
   * @param {object} req Express request
   * @param {object} res Express response
   */
  registerClient(jobId, req, res) {
    const job = jobStore.get(jobId);
    if (!job) {
      throw new ExpressError(404, 'Download job not found');
    }

    // Establish Server-Sent Events headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Bypass Nginx proxy buffering
    });

    res.write('\n'); // Flush output stream buffer

    // Track response instance
    if (!this.clients.has(jobId)) {
      this.clients.set(jobId, new Set());
    }
    this.clients.get(jobId).add(res);
    logger.info(`[SSEService] Client connected to stream for job ${jobId}. Active listeners: ${this.clients.get(jobId).size}`);

    // Send immediate connection greeting event
    this.sendEvent(res, 'job-connected', {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      speed: job.speed,
      eta: job.eta,
      filename: job.filename,
      queuePosition: queueManager.getQueuePosition(job.jobId)
    });

    // If job is already in a terminal state, push final status and close connection
    if (['completed', 'failed', 'cancelled'].includes(job.status)) {
      const eventName = `job-${job.status}`;
      this.sendEvent(res, eventName, {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        filename: job.filename,
        filepath: job.filepath,
        size: job.size,
        ...(job.error && { error: job.error })
      });
      
      setTimeout(() => {
        this.closeConnection(jobId, res);
      }, 2000);
      return;
    }

    // Intercept client-side browser disconnections
    req.on('close', () => {
      this.removeClient(jobId, res);
    });
  }

  /**
   * Removes a disconnected client from the listeners map.
   * 
   * @param {string} jobId 
   * @param {object} res Express response
   */
  removeClient(jobId, res) {
    const clientSet = this.clients.get(jobId);
    if (clientSet) {
      clientSet.delete(res);
      logger.info(`[SSEService] Client removed from job ${jobId}. Active listeners remaining: ${clientSet.size}`);
      if (clientSet.size === 0) {
        this.clients.delete(jobId);
        logger.info(`[SSEService] Cleared all connection references for job ${jobId}`);
      }
    }
  }

  /**
   * Formats and writes an SSE event block to the client response write stream.
   * 
   * @param {object} res Express response
   * @param {string} event Event name
   * @param {object} data JSON object payload
   */
  sendEvent(res, event, data) {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (typeof res.flush === 'function') {
        res.flush();
      }
    } catch (error) {
      logger.error(`[SSEService] Failed writing event "${event}" to client stream: ${error.message}`);
    }
  }

  /**
   * Broadcasts an SSE payload to all clients tracking a jobId.
   * 
   * @param {string} jobId 
   * @param {string} event Event name
   * @param {object} data JSON object payload
   */
  broadcast(jobId, event, data) {
    const clientSet = this.clients.get(jobId);
    if (clientSet && clientSet.size > 0) {
      logger.info(`[SSEService] Broadcasting event "${event}" for job ${jobId} to ${clientSet.size} listener(s)`);
      clientSet.forEach((res) => {
        this.sendEvent(res, event, data);
      });
    }
  }

  /**
   * Closes a single client connection gracefully.
   * 
   * @param {string} jobId 
   * @param {object} res Express response
   */
  closeConnection(jobId, res) {
    try {
      res.end();
      this.removeClient(jobId, res);
      logger.info(`[SSEService] Connection ended gracefully for job ${jobId}`);
    } catch (error) {
      logger.error(`[SSEService] Error ending client response stream for job ${jobId}: ${error.message}`);
    }
  }

  /**
   * Closes all active client connections tracking a jobId.
   * 
   * @param {string} jobId 
   */
  closeAllConnections(jobId) {
    const clientSet = this.clients.get(jobId);
    if (clientSet) {
      clientSet.forEach((res) => {
        this.closeConnection(jobId, res);
      });
    }
  }

  /**
   * Spawns a single shared heartbeat timer checking in every 20 seconds.
   */
  _startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.clients.size > 0) {
        logger.debug(`[SSEService] Broadcasting heartbeat to active clients`);
        const payload = { timestamp: new Date().toISOString() };
        this.clients.forEach((clientSet) => {
          clientSet.forEach((res) => {
            this.sendEvent(res, 'heartbeat', payload);
          });
        });
      }
    }, 20000); // 20 seconds heartbeat
  }

  /**
   * Binds global EventEmitter event listeners, translating process model transitions
   * into SSE broadcasts automatically.
   */
  _initEventListeners() {
    const eventTranslationMap = {
      'job:queued': 'job-queued',
      'job:started': 'job-started',
      'job:progress': 'job-progress',
      'job:completed': 'job-completed',
      'job:failed': 'job-failed',
      'job:cancelled': 'job-cancelled'
    };

    Object.keys(eventTranslationMap).forEach((emitterEvent) => {
      const sseEvent = eventTranslationMap[emitterEvent];

      appEmitter.on(emitterEvent, (jobData) => {
        // Broadcast parsed updates to all jobId listeners
        this.broadcast(jobData.jobId, sseEvent, {
          jobId: jobData.jobId,
          status: jobData.status,
          progress: jobData.progress,
          speed: jobData.speed,
          eta: jobData.eta,
          filename: jobData.filename,
          ...(jobData.filepath && { filepath: jobData.filepath }),
          ...(jobData.error && { error: jobData.error })
        });

        // Auto-close connections gracefully 3 seconds after terminal events resolve
        if (['job-completed', 'job-failed', 'job-cancelled'].includes(sseEvent)) {
          setTimeout(() => {
            this.closeAllConnections(jobData.jobId);
          }, 3000);
        }
      });
    });
  }
}

export const sseService = new SSEService();
export default sseService;
