import fs from 'fs';
import downloadService from '../services/download.service.js';
import queueManager from '../services/queueManager.js';
import sseService from '../services/sse.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { jobStore } from '../models/jobModel.js';
import { ExpressError } from '../utils/ExpressError.js';
import { logger } from '../utils/logger.js';

// Helper to look up job or throw 404
const getJobOrThrow = (jobId) => {
  const job = jobStore.get(jobId);
  if (!job) {
    throw new ExpressError(404, 'Download link has expired or job not found. Please try again.');
  }
  return job;
};

export const createDownload = asyncHandler(async (req, res) => {
  const { url, format, quality, container, title } = req.body;
  logger.info(`[DownloadController] New download request: ${format} from ${url}`);

  const job = await downloadService.startDownloadJob({ url, format, quality, container, title });
  const position = queueManager.getQueuePosition(job.jobId);

  res.status(202).json(
    new ApiResponse(202, { jobId: job.jobId, status: job.status, position }, 'Job added to queue.')
  );
});

export const getDownloadStatus = asyncHandler(async (req, res) => {
  const job = getJobOrThrow(req.params.jobId);
  const queuePosition = queueManager.getQueuePosition(job.jobId);

  if (job.status === 'completed') {
    return res.status(200).json(
      new ApiResponse(
        200,
        { status: 'completed', filename: job.filename, size: job.size, downloadReady: true },
        'Download job status retrieved'
      )
    );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: job.status,
        progress: job.progress,
        speed: job.speed,
        eta: job.eta,
        queuePosition,
        ...(job.error && { error: job.error })
      },
      'Download job status retrieved'
    )
  );
});

export const cancelDownload = asyncHandler(async (req, res) => {
  await queueManager.cancelJob(req.params.jobId);
  res.status(200).json(new ApiResponse(200, null, 'Job cancelled successfully.'));
});

export const retryDownload = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const position = queueManager.retryJob(jobId);
  const job = getJobOrThrow(jobId);

  res.status(200).json(
    new ApiResponse(200, { jobId: job.jobId, status: job.status, position }, 'Job retry initiated.')
  );
});

export const streamDownload = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  logger.info(`[DownloadController] SSE client streaming for jobId: ${jobId}`);
  sseService.registerClient(jobId, req, res);
});

export const downloadFile = asyncHandler(async (req, res) => {
  const job = getJobOrThrow(req.params.jobId);

  if (job.status !== 'completed' || !job.filepath) {
    throw new ExpressError(400, 'File is not ready for download');
  }

  if (!fs.existsSync(job.filepath)) {
    throw new ExpressError(410, 'Download link has expired and the file was removed. Please download again.');
  }

  const safeFilename = encodeURIComponent(job.filename);
  res.setHeader('Content-Disposition', `attachment; filename="${job.filename}"; filename*=UTF-8''${safeFilename}`);

  res.download(job.filepath, job.filename, (err) => {
    if (err) {
      logger.error(`[DownloadController] Error transferring file ${job.filepath}: ${err.message}`);
    }
  });
});

export default {
  createDownload,
  getDownloadStatus,
  cancelDownload,
  retryDownload,
  streamDownload,
  downloadFile
};
