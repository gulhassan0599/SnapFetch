import api from './api.js';

export const downloadService = {
  /**
   * Fetches media details (title, thumbnail, duration, uploader, qualities) using POST /media/info.
   * 
   * @param {string} url 
   */
  async getMetadata(url) {
    return api.post('/media/info', { url });
  },

  /**
   * Enqueues a download task using POST /downloads.
   * 
   * @param {object} payload { url, format, quality, container }
   */
  async startDownload(payload) {
    return api.post('/downloads', payload);
  },

  /**
   * Queries status and progress details using GET /downloads/:jobId.
   * 
   * @param {string} jobId 
   */
  async getStatus(jobId) {
    return api.get(`/downloads/${jobId}`);
  },

  /**
   * Cancels an active or queued download job using DELETE /downloads/:jobId.
   * 
   * @param {string} jobId 
   */
  async cancel(jobId) {
    return api.delete(`/downloads/${jobId}`);
  },

  /**
   * Retries a failed or cancelled download job using POST /downloads/:jobId/retry.
   * 
   * @param {string} jobId 
   */
  async retry(jobId) {
    return api.post(`/downloads/${jobId}/retry`);
  }
};

export default downloadService;
