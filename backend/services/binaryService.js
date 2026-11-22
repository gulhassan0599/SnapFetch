import config from '../config/index.js';
import { runProcess } from '../utils/processHelpers.js';

export const ytDlpService = {
  async getVersion() {
    const { stdout } = await runProcess(config.ytDlpPath, ['--version'], { timeout: 15000 });
    return stdout.trim();
  },

  async update() {
    const { stdout, stderr } = await runProcess(config.ytDlpPath, ['-U'], { timeout: 60000 });
    return (stdout || stderr).trim();
  },

  async execute(args, options = {}) {
    return runProcess(config.ytDlpPath, args, options);
  }
};

export const ffmpegService = {
  async getVersion() {
    const { stdout } = await runProcess(config.ffmpegPath, ['-version'], { timeout: 15000 });
    const match = stdout.match(/ffmpeg version ([^\s]+)/i);
    return match ? match[1] : 'unknown version';
  },

  async execute(args, options = {}) {
    return runProcess(config.ffmpegPath, args, options);
  }
};

export default {
  ytDlp: ytDlpService,
  ffmpeg: ffmpegService
};
