/**
 * Parses progress output lines from yt-dlp.
 * Example: [download]  10.0% of   5.00MiB at    1.00MiB/s ETA 00:04
 * 
 * @param {string} line A single line of stdout from yt-dlp.
 * @returns {object|null} Parsed stats, or null if line doesn't match progress.
 */
export const parseProgressLine = (line) => {
  if (!line || !line.includes('[download]')) return null;

  // Matches: percent, total size, speed, eta
  const progressRegex = /\[download\]\s+(\d+(?:\.\d+)?)%\s+of\s+~?([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+([^\s]+)/i;
  const match = line.match(progressRegex);

  if (match) {
    const progress = parseFloat(match[1]);
    const totalSizeStr = match[2];
    const speed = match[3];
    const eta = match[4];

    // Helper to convert size strings (e.g. 5.00MiB) to numeric bytes
    const parseSizeToBytes = (sizeStr) => {
      const units = {
        k: 1024,
        m: 1024 * 1024,
        g: 1024 * 1024 * 1024,
        t: 1024 * 1024 * 1024 * 1024
      };
      const cleanSize = sizeStr.toLowerCase().replace(/i?b/g, ''); // strip iB/B
      const num = parseFloat(cleanSize);
      const unit = cleanSize.charAt(cleanSize.length - 1);
      
      if (units[unit]) {
        return Math.round(num * units[unit]);
      }
      return Math.round(num) || 0;
    };

    const totalBytes = parseSizeToBytes(totalSizeStr);
    const downloadedBytes = Math.round((progress / 100) * totalBytes);

    return {
      progress,
      totalBytes,
      downloadedBytes,
      speed,
      eta
    };
  }

  return null;
};

export default parseProgressLine;
