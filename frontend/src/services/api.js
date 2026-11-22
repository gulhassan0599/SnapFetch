import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 35000, // 35 seconds timeout (slightly longer than backend yt-dlp 30s timeout)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response Interceptor for Centralized Error Handling
api.interceptors.response.use(
  (response) => {
    // Return the response data body directly (e.g., standard API responses)
    return response.data;
  },
  (error) => {
    let message = 'An unexpected error occurred';
    let statusCode = 500;

    if (error.response) {
      // Server responded with an error code
      statusCode = error.response.status;
      const data = error.response.data;
      message = data?.message || data?.error || message;
    } else if (error.request) {
      // Server was unreachable or timed out
      statusCode = 503;
      message = 'Backend server is unreachable. Please check your connection.';
    } else {
      message = error.message;
    }

    const apiError = {
      success: false,
      statusCode,
      message,
      originalError: error
    };

    return Promise.reject(apiError);
  }
);

export default api;
