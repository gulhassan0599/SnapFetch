import express from 'express';
import {
  createDownload,
  getDownloadStatus,
  cancelDownload,
  retryDownload,
  streamDownload,
  downloadFile
} from '../controllers/downloadController.js';
import { validateMediaUrl, validateDownloadOptions } from '../validators/requestValidators.js';

const router = express.Router();

router.post('/', validateMediaUrl, validateDownloadOptions, createDownload);
router.get('/:jobId', getDownloadStatus);
router.delete('/:jobId', cancelDownload);
router.post('/:jobId/retry', retryDownload);
router.get('/:jobId/stream', streamDownload);
router.get('/:jobId/file', downloadFile);

export default router;
