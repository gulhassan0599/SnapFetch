import { SUPPORTED_PLATFORMS } from '../constants/platforms.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';
import mediaService from '../services/media.service.js';

export const getSupportedPlatforms = asyncHandler(async (req, res) => {
  const platforms = SUPPORTED_PLATFORMS.map(({ id, name, domains }) => ({
    id,
    name,
    domains
  }));

  res.status(200).json(
    new ApiResponse(200, platforms, 'Supported platforms retrieved successfully.')
  );
});

export const getMediaInfo = asyncHandler(async (req, res, next) => {
  const { url } = req.body;
  logger.info(`[MediaController] Extracting info for: ${url}`);
  const start = Date.now();

  try {
    const metadata = await mediaService.getMetadata(url);
    if (req.platform) {
      metadata.platform = req.platform;
    }

    const durationMs = Date.now() - start;
    logger.info(`[MediaController] Extracted in ${durationMs}ms: [${metadata.website}] "${metadata.title}"`);

    res.status(200).json(
      new ApiResponse(200, metadata, 'Media information retrieved successfully.')
    );
  } catch (error) {
    const durationMs = Date.now() - start;
    logger.error(`[MediaController] Extraction failed after ${durationMs}ms: ${error.message}`);
    next(error);
  }
});

export default {
  getSupportedPlatforms,
  getMediaInfo
};
