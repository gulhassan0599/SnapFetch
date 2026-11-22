import fs from 'fs';
import path from 'path';

/**
 * Sanitizes a title string into an OS-safe filename.
 * Protects against directory traversal, truncates path length, and strips reserved chars.
 * 
 * @param {string} title Raw media title.
 * @param {string} extension Desired file extension (e.g. 'mp4', 'mp3').
 * @returns {string} Sanitized filename with extension.
 */
export const sanitizeFilename = (title, extension) => {
  if (!title) title = 'download';

  // Normalize Unicode to NFC form
  let clean = title.normalize('NFC');

  // Strip Windows reserved characters: < > : " / \ | ? * and controls
  clean = clean.replace(/[\<\>\:\"\/\\\|\?\*\x00-\x1F]/g, '_');

  // Replace whitespace/hyphens sequences with a single underscore
  clean = clean.replace(/[\s_]+/g, '_');

  // Trim underscores from start and end
  clean = clean.trim().replace(/^_+|_+$/g, '');

  // Limit filename base to 100 characters to prevent path length limits on Windows
  const safeExt = extension.replace(/^\./, '').toLowerCase();
  const truncatedBase = clean.substring(0, 100);

  return `${truncatedBase}.${safeExt}`;
};

/**
 * Formats bytes into a user-friendly size string (e.g. 14.5 MB).
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
export const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0 || !bytes || isNaN(bytes)) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Scans a directory and deletes files older than ageLimitMs.
 * @param {string} directory Path to storage directory.
 * @param {number} ageLimitMs Age threshold in milliseconds (default 1 hour).
 * @returns {Promise<string[]>} Array of paths to deleted files.
 */
export const cleanupExpiredFiles = async (directory, ageLimitMs = 3600000) => {
  const deletedFiles = [];
  try {
    if (!fs.existsSync(directory)) return deletedFiles;

    const files = await fs.promises.readdir(directory);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.promises.stat(filePath);
      
      // Skip directories and system hidden files (e.g., .gitkeep)
      if (!stats.isFile() || file.startsWith('.')) continue;

      const fileAge = now - stats.mtimeMs;
      if (fileAge > ageLimitMs) {
        await fs.promises.unlink(filePath);
        deletedFiles.push(filePath);
      }
    }
  } catch (error) {
    console.error(`[Cleanup Helper Error] Failed to scan/clean ${directory}: ${error.message}`);
  }
  return deletedFiles;
};
