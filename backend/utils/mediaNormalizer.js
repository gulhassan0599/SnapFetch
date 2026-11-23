/**
 * Safely parses a JSON string into an object.
 * @param {string} jsonString The JSON content to parse.
 * @returns {any} The parsed object or null if failed.
 */
export const safeJsonParse = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
};

/**
 * Formats a duration in seconds into a human-friendly string (HH:MM:SS or MM:SS).
 * @param {number} seconds Video/audio duration in seconds.
 * @returns {string}
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${formattedMins}:${formattedSecs}`;
  }
  return `${formattedMins}:${formattedSecs}`;
};

/**
 * Truncates a description string to a maximum length.
 * @param {string} description The raw text description.
 * @param {number} maxLength Max length before truncation.
 * @returns {string}
 */
export const truncateDescription = (description, maxLength = 300) => {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  return `${description.substring(0, maxLength).trim()}...`;
};

/**
 * Scans formats to extract user-friendly qualities.
 * Supported: 1080p, 720p, 480p, 360p, 240p, 144p.
 * Removes duplicates and sorts descending.
 * @param {object[]} formats The raw formats array from yt-dlp.
 * @returns {string[]}
 */
export const extractQualities = (formats = []) => {
  const targetHeights = [2160, 1440, 1080, 720, 480, 360, 240, 144];
  const foundHeights = new Map();

  // Find the best audio track size to accurately calculate combined media size
  let bestAudioBytes = 0;
  formats.forEach((f) => {
    if (f.vcodec === 'none' && f.acodec && f.acodec !== 'none') {
      const aSize = f.filesize || f.filesize_approx || 0;
      if (aSize > bestAudioBytes) bestAudioBytes = aSize;
    }
  });

  // Filter video formats (must have video codec)
  const videoFormats = formats.filter(
    (f) => f.vcodec && f.vcodec !== 'none'
  );

  videoFormats.forEach((format) => {
    const rawHeight = format.height;
    const rawWidth = format.width;

    // Determine the actual resolution dimension.
    // For vertical videos (Instagram Reels, TikTok: height > width, e.g. 1080x1920),
    // the video resolution quality is governed by the short edge (width = 1080p).
    let effectiveHeight = rawHeight;
    if (rawHeight && rawWidth && rawHeight > rawWidth) {
      effectiveHeight = rawWidth; // Use short dimension (1080 for 1080x1920)
    }

    if (effectiveHeight && targetHeights.includes(effectiveHeight)) {
      const existing = foundHeights.get(effectiveHeight);
      const currentSize = format.filesize || format.filesize_approx || 0;
      const existingSize = existing ? (existing.filesize || existing.filesize_approx || 0) : 0;
      if (!existing || currentSize > existingSize) {
        foundHeights.set(effectiveHeight, format);
      }
    } else if (effectiveHeight && effectiveHeight > 0) {
      // Map to nearest standard target
      const closest = targetHeights.reduce((prev, curr) =>
        Math.abs(curr - effectiveHeight) < Math.abs(prev - effectiveHeight) ? curr : prev
      );
      if (!foundHeights.has(closest)) {
        foundHeights.set(closest, format);
      }
    }
  });

  // Fallback: If no heights matched but video streams exist
  if (foundHeights.size === 0 && videoFormats.length > 0) {
    const bestFormat = videoFormats[videoFormats.length - 1];
    foundHeights.set(720, bestFormat);
  }

  // Sort heights descending (highest first)
  const sortedHeights = Array.from(foundHeights.keys()).sort((a, b) => b - a);

  // Return formatted objects with value and accurate total size label
  return sortedHeights.map((h) => {
    const format = foundHeights.get(h);
    const videoBytes = format ? (format.filesize || format.filesize_approx || 0) : 0;
    
    const isVideoOnly = format && format.vcodec && format.vcodec !== 'none' && (!format.acodec || format.acodec === 'none');
    const totalBytes = isVideoOnly ? (videoBytes + bestAudioBytes) : videoBytes;

    let sizeStr = '';
    if (totalBytes > 0) {
      const mb = (totalBytes / (1024 * 1024)).toFixed(1);
      sizeStr = ` (~${mb} MB)`;
    }

    let qualityName = `${h}p`;
    if (h >= 2160) {
      qualityName = '4k (2160p)';
    } else if (h >= 1440) {
      qualityName = '2k (1440p)';
    }

    return {
      value: h >= 2160 ? '4k' : (h >= 1440 ? '2k' : `${h}p`),
      label: `${qualityName}${sizeStr}`
    };
  });
};

/**
 * Scans formats to check if audio capabilities are available.
 * Returns ['MP3'] if audio formats exist.
 * @param {object[]} formats The raw formats array from yt-dlp.
 * @returns {string[]}
 */
export const extractAudioFormats = (formats = []) => {
  let bestAudioSize = 0;
  let hasAudio = false;

  formats.forEach((f) => {
    if ((f.acodec && f.acodec !== 'none') || (f.vcodec === 'none' && f.acodec && f.acodec !== 'none')) {
      hasAudio = true;
      const size = f.filesize || f.filesize_approx || 0;
      if (size > bestAudioSize) {
        bestAudioSize = size;
      }
    }
  });

  if (!hasAudio) return [];

  let sizeStr = '';
  if (bestAudioSize > 0) {
    const mb = (bestAudioSize / (1024 * 1024)).toFixed(1);
    sizeStr = ` (${mb} MB)`;
  }

  return [{
    value: 'MP3',
    label: `MP3${sizeStr}`
  }];
};

/**
 * Scans a thumbnails list to get the highest resolution thumbnail url.
 * @param {object[]} thumbnails Array of thumbnail objects.
 * @returns {string|null}
 */
export const getBestThumbnail = (thumbnails = []) => {
  if (!thumbnails || thumbnails.length === 0) return null;

  let best = thumbnails[0];
  let maxDim = (best.width || 0) * (best.height || 0);

  for (let i = 1; i < thumbnails.length; i++) {
    const t = thumbnails[i];
    const dim = (t.width || 0) * (t.height || 0);
    if (dim > maxDim) {
      best = t;
      maxDim = dim;
    }
  }

  return best.url || null;
};
