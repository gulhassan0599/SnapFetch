import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Executable paths
  ytDlpPath: process.env.YT_DLP_PATH || 'yt-dlp',
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  
  // Storage directories
  downloadDir: path.resolve(process.env.DOWNLOAD_DIRECTORY || './downloads'),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

export default config;
