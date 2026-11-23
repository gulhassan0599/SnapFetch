import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import downloadService from '../services/downloadService';
import createSSEService from '../services/sseService';
import { useToast } from './ToastContext';

const DownloadContext = createContext();

/**
 * Provides state and actions for the download lifecycle.
 * Manages metadata extraction, multiple queued/active download jobs, SSE connections, and download history.
 */
export const DownloadProvider = ({ children }) => {
  const { showToast } = useToast();
  
  const [searchUrl, setSearchUrl] = useState('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [activeMetadata, setActiveMetadata] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // Connection indicator per-job or aggregate
  const [connectionStates, setConnectionStates] = useState({});

  // List of active/queued download jobs: [ { jobId, url, filename, status, progress, speed, eta, ... } ]
  const [activeJobs, setActiveJobs] = useState([]);
  const activeJobsRef = useRef([]);
  activeJobsRef.current = activeJobs;

  // In-memory session history (recent downloads)
  const [recentDownloads, setRecentDownloads] = useState([]);

  // SSE service reference
  const sseServiceRef = useRef(null);

  useEffect(() => {
    sseServiceRef.current = createSSEService();
    return () => {
      if (sseServiceRef.current) {
        sseServiceRef.current.disconnect();
      }
    };
  }, []);

  /**
   * Handles EventSource message events for any jobId.
   */
  const handleSSEEvent = useCallback((jobId, eventName, data) => {
    if (eventName === 'heartbeat') return;

    const currentJob = activeJobsRef.current.find((j) => j.jobId === jobId);

    if (eventName === 'job-started') {
      showToast(`Download started: ${data.filename || currentJob?.filename || 'media file'}`, 'info');
    } else if (eventName === 'job-completed') {
      showToast(`Download completed: ${data.filename || currentJob?.filename || 'File'}! Starting transfer...`, 'success');
      
      // Auto-trigger direct download using an invisible iframe to prevent navigating away from the page
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const downloadUrl = `${backendUrl}/downloads/${jobId}/file`;
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (_) {}
      }, 30000);
    } else if (eventName === 'job-failed') {
      const errMsg = data.error || 'Execution error';
      showToast(`Download failed: ${errMsg}`, 'error');
    } else if (eventName === 'job-cancelled') {
      showToast(`Download was cancelled for: ${currentJob?.filename || jobId}`, 'warning');
    }

    // Terminal states: Move job from activeJobs to recentDownloads
    if (['job-completed', 'job-failed', 'job-cancelled'].includes(eventName)) {
      const finishedStatus = data.status || eventName.replace('job-', '');

      setActiveJobs((prev) => {
        const found = prev.find((j) => j.jobId === jobId);
        if (found) {
          const finishedJob = {
            ...found,
            status: finishedStatus,
            filename: data.filename || found.filename,
            filepath: data.filepath || found.filepath,
            size: data.size || found.size,
            error: data.error || found.error
          };
          setRecentDownloads((hist) => {
            if (hist.some((h) => h.jobId === jobId)) return hist;
            return [finishedJob, ...hist];
          });
        }
        return prev.filter((j) => j.jobId !== jobId);
      });
      return;
    }

    // Progress and state updates for active/queued jobs
    setActiveJobs((prev) => {
      return prev.map((j) => {
        if (j.jobId !== jobId) return j;
        return {
          ...j,
          status: data.status || j.status,
          progress: data.progress !== undefined ? data.progress : j.progress,
          speed: data.speed !== undefined ? data.speed : j.speed,
          eta: data.eta !== undefined ? data.eta : j.eta,
          filename: data.filename || j.filename,
          filepath: data.filepath || j.filepath,
          size: data.size || j.size,
          error: data.error || j.error,
          queuePosition: data.queuePosition !== undefined ? data.queuePosition : j.queuePosition
        };
      });
    });
  }, [showToast]);

  const handleSSEStateChange = useCallback((jobId, state) => {
    setConnectionStates((prev) => ({ ...prev, [jobId]: state }));
  }, []);

  const connectToJobStream = useCallback((jobId) => {
    if (!sseServiceRef.current) return;
    sseServiceRef.current.connect(jobId, {
      onEvent: handleSSEEvent,
      onStateChange: handleSSEStateChange
    });
  }, [handleSSEEvent, handleSSEStateChange]);

  /**
   * Fetches metadata for the given URL.
   */
  const fetchMetadata = useCallback(async (url) => {
    if (!url) return;
    setIsLoadingMetadata(true);
    setActiveMetadata(null);
    setErrorDetails(null);

    try {
      const response = await downloadService.getMetadata(url);
      if (response && response.success) {
        setActiveMetadata({
          title: response.data.title,
          thumbnail: response.data.thumbnail,
          duration: response.data.duration,
          website: response.data.website,
          uploader: response.data.uploader,
          isPlaylist: response.data.isPlaylist,
          isLive: response.data.isLive,
          qualities: response.data.qualities || [],
          audio: response.data.audio || response.data.audioFormats || [],
          originalUrl: response.data.originalUrl
        });
        showToast('Media details extracted successfully.', 'success');
      } else {
        setErrorDetails({
          type: 'fetch',
          title: 'Extraction Error',
          message: response?.message || 'Could not fetch metadata for this URL',
          url
        });
      }
    } catch (error) {
      const errMsg = error.message || 'An error occurred while fetching media metadata';
      setErrorDetails({
        type: 'fetch',
        title: 'Network or Server Error',
        message: errMsg,
        url
      });
      showToast(errMsg, 'error');
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [showToast]);

  /**
   * Starts a new download job and adds it to the queue/active jobs.
   */
  const startDownload = useCallback(async (quality, container, format) => {
    if (!activeMetadata) return;

    setIsCreatingJob(true);
    try {
      const payload = {
        url: activeMetadata.originalUrl,
        format,
        quality: format === 'audio' ? 'best' : quality,
        container,
        title: activeMetadata.title
      };

      const response = await downloadService.startDownload(payload);
      if (response && response.success) {
        const jobData = response.data; // { jobId, status, position }
        
        const newJob = {
          jobId: jobData.jobId,
          url: activeMetadata.originalUrl,
          filename: `${activeMetadata.title.replace(/[\s?|:*<>\\/]+/g, '_')}.${container}`,
          title: activeMetadata.title,
          status: jobData.status || 'queued',
          queuePosition: jobData.position,
          progress: 0,
          quality,
          container,
          format,
          createdAt: new Date()
        };

        setActiveJobs((prev) => [...prev, newJob]);
        
        const isQueued = jobData.position > 0 || jobData.status === 'queued';
        showToast(
          isQueued 
            ? `Download queued at position #${jobData.position}!` 
            : `Download initiated!`,
          'success'
        );
        
        // Clear active metadata and search input so user can add another URL right away
        setActiveMetadata(null);
        setSearchUrl('');

        // Connect SSE stream for this job
        connectToJobStream(jobData.jobId);
      } else {
        setErrorDetails({
          type: 'download',
          title: 'Download Job Creation Failed',
          message: response?.message || 'Server rejected download request',
          url: activeMetadata.originalUrl
        });
        showToast(response?.message || 'Failed to start download job.', 'error');
      }
    } catch (error) {
      const errMsg = error.message || 'An error occurred while initiating the download';
      setErrorDetails({
        type: 'download',
        title: 'Download Job Failed',
        message: errMsg,
        url: activeMetadata?.originalUrl
      });
      showToast(errMsg, 'error');
    } finally {
      setIsCreatingJob(false);
    }
  }, [activeMetadata, connectToJobStream, showToast]);

  /**
   * Cancels a download job.
   */
  const cancelJob = useCallback(async (jobId) => {
    if (!jobId) return;

    try {
      const response = await downloadService.cancel(jobId);
      if (response && response.success) {
        if (sseServiceRef.current) {
          sseServiceRef.current.disconnect(jobId);
        }
        setActiveJobs((prev) => prev.filter((j) => j.jobId !== jobId));
        showToast('Download cancelled.', 'info');
      } else {
        showToast('Failed to cancel download job.', 'error');
      }
    } catch (error) {
      const errMsg = error.message || 'An error occurred while cancelling the download job';
      showToast(errMsg, 'error');
    }
  }, [showToast]);

  /**
   * Retries a failed or cancelled download job.
   */
  const retryJob = useCallback(async (job) => {
    if (!job) return;

    setIsCreatingJob(true);
    try {
      const response = await downloadService.retry(job.jobId);
      if (response && response.success) {
        const jobData = response.data;

        // Remove from recent downloads
        setRecentDownloads((prev) => prev.filter((j) => j.jobId !== job.jobId));

        const updatedJob = {
          ...job,
          status: jobData.status || 'queued',
          queuePosition: jobData.position,
          progress: 0,
          speed: null,
          eta: null,
          error: null
        };

        setActiveJobs((prev) => [...prev, updatedJob]);
        showToast(`Job retried. Position #${jobData.position}`, 'success');

        connectToJobStream(jobData.jobId);
      } else {
        showToast('Failed to initiate retry.', 'error');
      }
    } catch (error) {
      const errMsg = error.message || 'An error occurred while retrying the download job';
      showToast(errMsg, 'error');
    } finally {
      setIsCreatingJob(false);
    }
  }, [connectToJobStream, showToast]);

  // Aggregate connection state
  const connectionState = useMemo(() => {
    const states = Object.values(connectionStates);
    if (states.includes('reconnecting')) return 'reconnecting';
    if (states.includes('connected')) return 'connected';
    return 'disconnected';
  }, [connectionStates]);

  // Single active job helper for backward compatibility
  const activeJob = activeJobs[0] || null;

  const contextValue = useMemo(() => ({
    searchUrl,
    setSearchUrl,
    isLoadingMetadata,
    isCreatingJob,
    activeMetadata,
    setActiveMetadata,
    errorDetails,
    setErrorDetails,
    connectionState,
    activeJobs,
    activeJob,
    recentDownloads,
    fetchMetadata,
    startDownload,
    cancelJob,
    retryJob
  }), [
    searchUrl,
    isLoadingMetadata,
    isCreatingJob,
    activeMetadata,
    errorDetails,
    connectionState,
    activeJobs,
    activeJob,
    recentDownloads,
    fetchMetadata,
    startDownload,
    cancelJob,
    retryJob
  ]);

  return (
    <DownloadContext.Provider value={contextValue}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
};
