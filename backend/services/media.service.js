import { ytDlpService } from './binaryService.js';
import { logger } from '../utils/logger.js';
import { ExpressError } from '../utils/ExpressError.js';
import {
  safeJsonParse,
  formatDuration,
  truncateDescription,
  extractQualities,
  extractAudioFormats,
  getBestThumbnail
} from '../utils/mediaNormalizer.js';

export const mediaService = {
  /**
   * Fetches metadata for a given URL using yt-dlp in metadata extraction mode.
   * 
   * @param {string} url The media URL.
   * @returns {Promise<object>} Normalized metadata representation.
   */
  async getMetadata(url) {
    const start = Date.now();
    logger.info(`[MediaService] Extracting metadata for: ${url}`);

    try {
      const { stdout } = await ytDlpService.execute([
        '--dump-single-json',
        '--flat-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--prefer-free-formats',
        url
      ], { timeout: 45000 });

      const durationMs = Date.now() - start;
      logger.info(`[MediaService] Extraction successful in ${durationMs}ms`);

      const rawData = safeJsonParse(stdout);
      if (!rawData) {
        throw new ExpressError(500, 'Failed to parse media metadata response from extractor');
      }

      // Check if the returned object is a playlist
      if (rawData._type === 'playlist') {
        const videoCount = Array.isArray(rawData.entries) ? rawData.entries.length : 0;
        return {
          title: rawData.title || 'Playlist',
          thumbnail: getBestThumbnail(rawData.thumbnails) || null,
          duration: null,
          website: rawData.extractor_key || 'unknown',
          uploader: rawData.uploader || rawData.channel || 'unknown',
          isPlaylist: true,
          isLive: false,
          videoCount,
          originalUrl: url,
          extractor: rawData.extractor || 'unknown'
        };
      }

      // Handle standard single media extraction
      const qualities = extractQualities(rawData.formats || []);
      const audioFormats = extractAudioFormats(rawData.formats || []);

      return {
        title: rawData.title || 'Untitled Media',
        description: truncateDescription(rawData.description || '', 300),
        duration: formatDuration(rawData.duration),
        durationSeconds: rawData.duration || 0,
        thumbnail: getBestThumbnail(rawData.thumbnails) || rawData.thumbnail || null,
        uploader: rawData.uploader || rawData.channel || rawData.creator || 'Unknown Uploader',
        website: rawData.extractor_key || 'unknown',
        qualities,
        audioFormats,
        viewCount: rawData.view_count || null,
        uploadDate: rawData.upload_date || null,
        isPlaylist: false,
        isLive: Boolean(rawData.is_live),
        originalUrl: url,
        extractor: rawData.extractor || 'unknown'
      };
    } catch (error) {
      if (error instanceof ExpressError && error.statusCode !== 500) throw error;

      let statusCode = 400;
      let errorMessage = 'Failed to retrieve media information';
      const errorStr = (error.message || '').toLowerCase();

      if (errorStr.includes('unsupported url')) {
        statusCode = 400;
        errorMessage = 'The provided URL is from an unsupported website';
      } else if (errorStr.includes('private')) {
        statusCode = 403;
        errorMessage = 'This media is private and cannot be accessed';
      } else if (errorStr.includes('removed') || errorStr.includes('deleted') || errorStr.includes('not available')) {
        statusCode = 404;
        errorMessage = 'This media has been removed or is unavailable';
      } else if (errorStr.includes('sign in') || errorStr.includes('age-gated') || errorStr.includes('confirm your age') || errorStr.includes('bot')) {
        statusCode = 403;
        errorMessage = 'This platform is blocking automated requests or requires user sign-in';
      } else if (errorStr.includes('timed out')) {
        statusCode = 504;
        errorMessage = 'The connection to the media host timed out. Please try again.';
      } else if (error.message) {
        // Clean extractor error message to show helpful message to client
        const cleanMsg = error.message
          .replace(/Command failed with exit code \d+\.?/i, '')
          .replace(/ERROR:\s*/i, '')
          .replace(/Executable binary not found:.*/i, 'Media extractor engine is not configured properly on the server.')
          .trim();
        if (cleanMsg) {
          errorMessage = cleanMsg;
        }
      }

      logger.error(`[MediaService] Extraction failed: ${errorMessage}. Raw: ${error.message}`);
      throw new ExpressError(statusCode, errorMessage);
    }
  }
};

export default mediaService;
