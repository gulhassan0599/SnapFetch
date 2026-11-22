import { ExpressError } from '../utils/ExpressError.js';
import { getPlatformByUrl, getSupportedPlatformNames } from '../utils/platformHelpers.js';

const SUPPORTED_CONTAINERS = {
  video: ['mp4'],
  audio: ['mp3']
};

const SUPPORTED_QUALITIES = ['4k', '2k', '1080p', '720p', '480p', '360p', '240p', '144p'];

/**
 * Validates incoming URL: existence, http/https protocol, and platform whitelist.
 * Attaches the matched platform object to req.platform.
 */
export const validateMediaUrl = (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return next(new ExpressError(400, 'URL is required in the request body'));
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return next(new ExpressError(400, 'URL protocol must be http or https'));
    }

    const platform = getPlatformByUrl(url);
    if (!platform) {
      const allowedNames = getSupportedPlatformNames().join(', ');
      return next(
        new ExpressError(
          400,
          `Unsupported platform. Only popular platforms are supported: ${allowedNames}`
        )
      );
    }

    req.platform = platform;
    next();
  } catch (error) {
    if (error instanceof ExpressError) return next(error);
    return next(new ExpressError(400, 'The provided URL is invalid or malformed'));
  }
};

/**
 * Validates download payload options (format, container, quality).
 * Assumes URL has already been validated by validateMediaUrl.
 */
export const validateDownloadOptions = (req, res, next) => {
  const { format, quality, container } = req.body;

  // 1. Validate Format
  if (!format || !['video', 'audio'].includes(format)) {
    return next(new ExpressError(400, 'Format must be either "video" or "audio"'));
  }

  // 2. Validate Container
  const allowedContainers = SUPPORTED_CONTAINERS[format];
  if (!container || !allowedContainers.includes(container.toLowerCase())) {
    return next(
      new ExpressError(
        400,
        `Supported containers for ${format} are: ${allowedContainers.join(', ')}`
      )
    );
  }

  // 3. Validate Quality (only relevant for video format)
  if (format === 'video') {
    if (!quality || !SUPPORTED_QUALITIES.includes(quality.toLowerCase())) {
      return next(
        new ExpressError(
          400,
          `Supported video qualities are: ${SUPPORTED_QUALITIES.join(', ')}`
        )
      );
    }
  }

  next();
};

export default {
  validateMediaUrl,
  validateDownloadOptions
};
