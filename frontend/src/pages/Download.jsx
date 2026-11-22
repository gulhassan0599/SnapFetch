import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDownload } from "../context/DownloadContext";
import { useToast } from "../context/ToastContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { SkeletonCard } from "../components/common/Skeleton";
import { ProgressBar } from "../components/common/ProgressBar";
import {
  FiLink,
  FiVideo,
  FiDownload,
  FiX,
  FiXCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiActivity,
  FiAlertCircle,
  FiWifi,
  FiWifiOff,
  FiPlusCircle,
  FiLoader,
  FiClock,
} from "react-icons/fi";

/**
 * Download Page Component
 * Handles the main interface for analyzing URLs and initiating media downloads.
 * Optimized with useCallback for event handlers and useMemo for derived state to prevent unnecessary re-renders.
 */
export const Download = () => {
  const { showToast } = useToast();
  const {
    searchUrl,
    setSearchUrl,
    isLoadingMetadata,
    isCreatingJob,
    activeMetadata,
    errorDetails,
    connectionState,
    activeJobs,
    recentDownloads,
    fetchMetadata,
    startDownload,
    cancelJob,
    retryJob,
  } = useDownload();

  const [selectedQuality, setSelectedQuality] = useState("");
  const [selectedContainer, setSelectedContainer] = useState("mp4");
  const [selectedFormat, setSelectedFormat] = useState("video"); // video, audio
  const [errorInput, setErrorInput] = useState("");
  const [dismissedJobId, setDismissedJobId] = useState(null);

  // Dynamically set default format selectors once metadata loads
  useEffect(() => {
    if (activeMetadata) {
      if (activeMetadata.qualities && activeMetadata.qualities.length > 0) {
        const first = activeMetadata.qualities[0];
        setSelectedQuality(typeof first === "object" ? first.value : first);
      } else {
        setSelectedQuality("");
      }
      setSelectedFormat(
        activeMetadata.qualities.length > 0 ? "video" : "audio",
      );
    }
  }, [activeMetadata]);

  /**
   * Handles the form submission to fetch metadata for the provided URL.
   */
  const handleSubmitUrl = useCallback(
    (e) => {
      e.preventDefault();
      if (!searchUrl) {
        setErrorInput("Media URL is required");
        return;
      }
      if (
        !searchUrl.startsWith("http://") &&
        !searchUrl.startsWith("https://")
      ) {
        setErrorInput("URL protocol must be http or https");
        return;
      }
      setErrorInput("");
      fetchMetadata(searchUrl);
    },
    [searchUrl, fetchMetadata],
  );

  /**
   * Initiates the download process with the selected format and quality.
   */
  const handleStartDownload = useCallback(() => {
    if (selectedFormat === "video" && !selectedQuality) {
      setErrorInput("Please select a video quality resolution");
      return;
    }
    const container = selectedFormat === "audio" ? "mp3" : selectedContainer;
    startDownload(selectedQuality, container, selectedFormat);
  }, [selectedFormat, selectedQuality, selectedContainer, startDownload]);

  /**
   * Mocks a file download for the completed job (for UI demonstration purposes).
   * @param {string} filename - The name of the file to download.
   */
  /**
   * Downloads the actual completed file from the backend API.
   * @param {string} jobId - The job ID of the completed download.
   */
  const handleFileDownload = useCallback(
    async (jobId) => {
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const downloadEndpoint = `${backendUrl}/downloads/${jobId}/file`;

      try {
        const res = await fetch(downloadEndpoint, { method: "HEAD" });
        if (res.status === 404 || res.status === 410) {
          showToast(
            "Download link has expired and the file was removed. Please download again.",
            "warning",
          );
          return;
        }
        window.open(downloadEndpoint, "_blank");
      } catch {
        window.open(downloadEndpoint, "_blank");
      }
    },
    [showToast],
  );

  /**
   * Determines the label for the download button based on active jobs state.
   */
  const getDownloadButtonLabel = useCallback(() => {
    if (isCreatingJob) return "Initiating...";
    if (activeJobs && activeJobs.length > 0) return "Add to Queue";
    return "Start Download Job";
  }, [isCreatingJob, activeJobs]);

  /**
   * Renders the connection indicator badge based on the SSE connection state.
   */
  const connectionIndicator = useMemo(() => {
    switch (connectionState) {
      case "connected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
            <FiWifi className="animate-pulse" />
            Connected
          </span>
        );
      case "reconnecting":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400 animate-pulse">
            <FiWifi className="animate-spin" />
            Reconnecting
          </span>
        );
      case "disconnected":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <FiWifiOff />
            Offline
          </span>
        );
    }
  }, [connectionState]);

  const latestFinishedJob =
    recentDownloads.length > 0 && recentDownloads[0].jobId !== dismissedJobId
      ? recentDownloads[0]
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Media Downloader
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Analyze links and extract audio or video streams in real-time.
          </p>
        </div>
        <div className="self-start sm:self-center">{connectionIndicator}</div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* URL Input Card */}
        <Card>
          <form onSubmit={handleSubmitUrl} className="space-y-4">
            <Input
              id="url-input"
              label="Media URL"
              placeholder="Paste video or audio URL (e.g. YouTube, TikTok, Instagram, Facebook, X, etc.)"
              icon={FiLink}
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              error={errorInput}
              disabled={isLoadingMetadata || isCreatingJob}
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <Link
                to={
                  searchUrl
                    ? `/request-platform?url=${encodeURIComponent(searchUrl)}`
                    : "/request-platform"
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              >
                <FiPlusCircle /> Trying an unsupported site? Request it here
              </Link>
              <Button
                type="submit"
                isLoading={isLoadingMetadata}
                disabled={isCreatingJob}
                className="font-bold focus-visible:ring-2 focus-visible:ring-blue-500 w-full sm:w-auto"
              >
                Analyze URL
              </Button>
            </div>
          </form>
        </Card>

        {/* Loading Placeholder */}
        {isLoadingMetadata && (
          <div className="space-y-4">
            <SkeletonCard />
          </div>
        )}

        {/* Comprehensive Error & Unsupported Platform Card */}
        {errorDetails && !isLoadingMetadata && !activeMetadata && (
          <Card
            className={`space-y-5 animate-fade-in ${
              errorDetails.type === "unsupported"
                ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20"
                : "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  errorDetails.type === "unsupported"
                    ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                    : "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
                }`}
              >
                <FiAlertCircle size={28} />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider block ${
                    errorDetails.type === "unsupported"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {errorDetails.title || "Error Encountered"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {errorDetails.type === "unsupported"
                    ? `${errorDetails.domain || "This platform"} is not in our approved list`
                    : "Something went wrong while processing this link"}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed wrap-break-words">
                  {errorDetails.message}
                </p>
              </div>
            </div>

            {/* Action Section */}
            <div
              className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/60 border ${
                errorDetails.type === "unsupported"
                  ? "border-amber-200/60 dark:border-amber-900/40"
                  : "border-red-200/60 dark:border-red-900/40"
              }`}
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center sm:text-left">
                {errorDetails.type === "unsupported" ? (
                  <>
                    <span>Want to download videos from </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {errorDetails.domain}
                    </span>
                    ?
                  </>
                ) : (
                  <span>
                    Need this link or platform supported? Request our team to
                    investigate:
                  </span>
                )}
              </div>
              <Link
                to={`/request-platform?url=${encodeURIComponent(errorDetails.url || "")}&platform=${encodeURIComponent(errorDetails.domain || "")}`}
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto font-bold gap-2 text-xs py-2">
                  <FiPlusCircle size={15} />
                  Request Platform Support
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Media Preview & Options Card */}
        {activeMetadata && !isLoadingMetadata && (
          <Card className="space-y-6 animate-fade-in">
            {/* Media Preview Detail */}
            <div className="flex flex-col sm:flex-row gap-6">
              {activeMetadata.thumbnail ? (
                <img
                  src={activeMetadata.thumbnail}
                  alt={activeMetadata.title}
                  className="w-full sm:w-48 aspect-video rounded-xl object-cover bg-slate-100 border border-slate-200/50 dark:border-slate-700"
                />
              ) : (
                <div className="w-full sm:w-48 aspect-video rounded-xl bg-slate-150 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <FiVideo size={36} />
                </div>
              )}
              <div className="space-y-2 grow min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    {activeMetadata.website}
                  </span>
                  {activeMetadata.isLive && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 animate-pulse">
                      Live Stream
                    </span>
                  )}
                  {activeMetadata.isPlaylist && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                      Playlist
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug wrap-break-words">
                  {activeMetadata.title}
                </h3>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4">
                  <span>Uploader: {activeMetadata.uploader}</span>
                  {activeMetadata.duration && (
                    <span>Duration: {activeMetadata.duration}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-4 border-t border-slate-150 dark:border-slate-700">
              {/* Format selection */}
              <div className="w-full sm:w-[25%] space-y-2">
                <label
                  htmlFor="format-select"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Format
                </label>
                <select
                  id="format-select"
                  value={selectedFormat}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedFormat(val);
                    setSelectedContainer(val === "video" ? "mp4" : "mp3");

                    // Auto-select first quality option for new format
                    const audioList = activeMetadata.audio || activeMetadata.audioFormats || [];
                    if (val === "audio") {
                      if (audioList.length > 0) {
                        const first = audioList[0];
                        setSelectedQuality(typeof first === "object" ? first.value : first);
                      } else {
                        setSelectedQuality("MP3");
                      }
                    } else if (val === "video" && activeMetadata.qualities && activeMetadata.qualities.length > 0) {
                      const first = activeMetadata.qualities[0];
                      setSelectedQuality(typeof first === "object" ? first.value : first);
                    }
                  }}
                  className="block w-full rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 text-sm py-2.5 px-4 font-semibold cursor-pointer"
                >
                  <option
                    value="video"
                    disabled={!activeMetadata.qualities || activeMetadata.qualities.length === 0}
                  >
                    Video (MP4)
                  </option>
                  <option
                    value="audio"
                    disabled={
                      (activeMetadata.audio && activeMetadata.audio.length === 0) &&
                      (activeMetadata.audioFormats && activeMetadata.audioFormats.length === 0)
                    }
                  >
                    Audio Only (MP3)
                  </option>
                </select>
              </div>

              {/* Quality selections */}
              {((selectedFormat === "video" &&
                activeMetadata.qualities &&
                activeMetadata.qualities.length > 0) ||
                (selectedFormat === "audio")) && (
                <div className="w-full sm:w-[70%] space-y-2">
                  <label
                    htmlFor="quality-select"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Quality
                  </label>
                  <select
                    id="quality-select"
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 text-sm py-2.5 px-4 font-semibold cursor-pointer"
                  >
                    {selectedFormat === "video" ? (
                      activeMetadata.qualities.map((quality) => {
                        const value =
                          typeof quality === "object" ? quality.value : quality;
                        const label =
                          typeof quality === "object" ? quality.label : quality;
                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })
                    ) : (
                      (activeMetadata.audio && activeMetadata.audio.length > 0
                        ? activeMetadata.audio
                        : activeMetadata.audioFormats && activeMetadata.audioFormats.length > 0
                        ? activeMetadata.audioFormats
                        : [{ value: 'MP3', label: 'MP3 (Highest Quality)' }]
                      ).map((quality) => {
                        const value =
                          typeof quality === "object" ? quality.value : quality;
                        const label =
                          typeof quality === "object" ? quality.label : quality;
                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Download CTA Button */}
            <div className="flex justify-end pt-4 border-t border-slate-150 dark:border-slate-700">
              <Button
                size="lg"
                isLoading={isCreatingJob}
                className="w-full sm:w-auto font-bold gap-2 focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={handleStartDownload}
              >
                <FiDownload size={18} />
                {getDownloadButtonLabel()}
              </Button>
            </div>
          </Card>
        )}

        {/* LATEST FINISHED JOB CARD (COMPLETED STATE) */}
        {latestFinishedJob && latestFinishedJob.status === "completed" && (
          <Card className="border-green-200 bg-green-50/15 dark:border-green-950/20 dark:bg-green-950/5 space-y-4 animate-fade-in relative">
            <button
              onClick={() => setDismissedJobId(latestFinishedJob.jobId)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Dismiss completed download notification"
            >
              <FiX size={18} />
            </button>
            <div className="flex items-start gap-4 pr-6">
              <div className="p-3 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-2xl">
                <FiCheckCircle
                  size={28}
                  className="animate-[pulse_2s_infinite]"
                />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {latestFinishedJob.filename}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  File Size: {latestFinishedJob.size || "Saved"} • Format:{" "}
                  {latestFinishedJob.container}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold pt-1">
                  ✓ Download completed
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                className="font-bold gap-2 text-xs"
                onClick={() => handleFileDownload(latestFinishedJob.jobId)}
              >
                <FiDownload size={14} />
                Download Again
              </Button>
            </div>
          </Card>
        )}

        {/* LATEST FINISHED JOB CARD (FAILED STATE) */}
        {latestFinishedJob && latestFinishedJob.status === "failed" && (
          <Card className="border-red-200 bg-red-50/15 dark:border-red-950/20 dark:bg-red-950/5 space-y-4 animate-fade-in relative">
            <button
              onClick={() => setDismissedJobId(latestFinishedJob.jobId)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Dismiss failed download notification"
            >
              <FiX size={18} />
            </button>
            <div className="flex items-start gap-4 pr-6">
              <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl">
                <FiAlertCircle size={28} />
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold text-red-600/75 dark:text-red-400 block">
                  Download Failed
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  An error occurred during download execution
                </h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                  Reason:{" "}
                  {latestFinishedJob.error ||
                    "The backend extractor process failed unexpectedly."}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                className="font-bold gap-1.5"
                onClick={() => retryJob(latestFinishedJob)}
              >
                <FiRefreshCw size={14} />
                Retry Download
              </Button>
            </div>
          </Card>
        )}

        {/* Live Active & Queued Jobs List */}
        {activeJobs && activeJobs.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiActivity className="text-blue-500" />
                <span>Active & Queued Downloads ({activeJobs.length})</span>
              </h2>
            </div>

            <div className="space-y-4">
              {activeJobs.map((job) => {
                const isProcessing = job.status === "processing";
                return (
                  <Card
                    key={job.jobId}
                    className="space-y-4 border-blue-200 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-150 dark:border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                        {isProcessing ? (
                          <>
                            <FiActivity className="text-blue-500 animate-pulse shrink-0" />
                            <span className="truncate">Downloading...</span>
                          </>
                        ) : (
                          <>
                            <FiClock className="text-amber-500 animate-spin shrink-0" />
                            <span className="truncate">Queued (Position #{job.queuePosition || 1})</span>
                          </>
                        )}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isProcessing 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}>
                        <FiLoader className="animate-spin text-xs" />
                        {job.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Tracking ID: {job.jobId}
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {job.title || job.filename}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                          {job.quality || "Audio"} • {job.container}
                        </p>
                      </div>

                      {/* Progress Bar with dynamic label */}
                      <ProgressBar
                        progress={job.progress || (isProcessing ? 5 : 0)}
                        status={job.status}
                      />

                      {isProcessing ? (
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                          <div className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                            <span className="block text-slate-400 text-[11px] mb-0.5">
                              Download Speed
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                              {job.speed || "Calculating..."}
                            </span>
                          </div>
                          <div className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                            <span className="block text-slate-400 text-[11px] mb-0.5">
                              Estimated Time (ETA)
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                              {job.eta || "Calculating..."}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                          <span>Waiting in queue</span>
                          <span className="font-extrabold text-amber-600 dark:text-amber-400">
                            Position: #{job.queuePosition !== undefined ? job.queuePosition : 1}
                          </span>
                        </div>
                      )}

                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full font-bold gap-1.5 text-xs focus-visible:ring-2 focus-visible:ring-red-400"
                        onClick={() => cancelJob(job.jobId)}
                      >
                        <FiXCircle size={14} />
                        Cancel Download
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Download);
