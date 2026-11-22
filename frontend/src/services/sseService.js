export const createSSEService = () => {
  const connections = new Map(); // jobId -> { eventSource, reconnectTimeout, isManuallyClosed }

  const getBaseURL = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  };

  const connect = (jobId, { onEvent, onStateChange }) => {
    if (connections.has(jobId)) {
      console.warn(`[SSEService] Connection already exists for job: ${jobId}`);
      return;
    }

    const conn = {
      eventSource: null,
      reconnectTimeout: null,
      isManuallyClosed: false
    };
    connections.set(jobId, conn);

    const startStream = () => {
      if (conn.isManuallyClosed) return;

      const url = `${getBaseURL()}/downloads/${jobId}/stream`;
      console.log(`[SSEService] Connecting to SSE stream for job ${jobId}: ${url}`);

      const es = new EventSource(url);
      conn.eventSource = es;

      if (onStateChange) onStateChange(jobId, 'connected');

      const handleMessage = (event) => {
        try {
          const eventName = event.type;
          const data = JSON.parse(event.data);
          if (onEvent) onEvent(jobId, eventName, data);

          if (['job-completed', 'job-failed', 'job-cancelled'].includes(eventName)) {
            disconnect(jobId);
          }
        } catch (err) {
          console.error(`[SSEService] Error parsing event data for job ${jobId}:`, err);
        }
      };

      const events = [
        'job-connected',
        'job-queued',
        'job-started',
        'job-progress',
        'job-completed',
        'job-failed',
        'job-cancelled',
        'heartbeat'
      ];

      events.forEach((evt) => {
        es.addEventListener(evt, handleMessage);
      });

      es.onerror = async (error) => {
        console.error(`[SSEService] EventSource error for job ${jobId}:`, error);

        if (conn.isManuallyClosed) return;

        if (onStateChange) onStateChange(jobId, 'reconnecting');
        es.close();
        conn.eventSource = null;

        try {
          const checkRes = await fetch(`${getBaseURL()}/downloads/${jobId}`);
          if (checkRes.status === 404) {
            console.error(`[SSEService] Job ${jobId} not found on server. Aborting reconnect.`);
            conn.isManuallyClosed = true;
            if (onEvent) onEvent(jobId, 'job-failed', { jobId, status: 'failed', error: 'Download job was lost (Server may have restarted)' });
            if (onStateChange) onStateChange(jobId, 'disconnected');
            disconnect(jobId);
            return;
          }
        } catch {
          // Ignore network errors, proceed with retry
        }

        conn.reconnectTimeout = setTimeout(() => {
          if (!conn.isManuallyClosed) {
            console.log(`[SSEService] Reconnecting for job ${jobId}...`);
            startStream();
          }
        }, 3000);
      };
    };

    startStream();
  };

  const disconnect = (jobId) => {
    if (!jobId) {
      // Disconnect all
      connections.forEach((conn) => {
        conn.isManuallyClosed = true;
        if (conn.reconnectTimeout) clearTimeout(conn.reconnectTimeout);
        if (conn.eventSource) conn.eventSource.close();
      });
      connections.clear();
      return;
    }

    const conn = connections.get(jobId);
    if (conn) {
      conn.isManuallyClosed = true;
      if (conn.reconnectTimeout) clearTimeout(conn.reconnectTimeout);
      if (conn.eventSource) conn.eventSource.close();
      connections.delete(jobId);
      console.log(`[SSEService] Disconnected SSE for job ${jobId}`);
    }
  };

  return {
    connect,
    disconnect
  };
};

export default createSSEService;
