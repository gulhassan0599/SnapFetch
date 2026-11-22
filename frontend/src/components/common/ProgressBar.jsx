import React from 'react';

export const ProgressBar = ({ progress = 0, status = 'processing', showText = true, className = '' }) => {
  const percentage = Math.min(Math.max(progress, 0), 100);

  const colors = {
    queued: 'bg-slate-400 dark:bg-slate-500',
    processing: 'bg-linear-to-r from-blue-500 to-cyan-500',
    completed: 'bg-green-500 dark:bg-green-400',
    failed: 'bg-red-500 dark:bg-red-400',
    cancelled: 'bg-yellow-500 dark:bg-yellow-400'
  };

  const statusColor = colors[status] || colors.processing;

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
          <span className="capitalize">{status}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Download progress: ${percentage.toFixed(0)}%`}
          className={`h-full rounded-full transition-all duration-300 ${statusColor} ${
            status === 'processing' ? 'animate-[pulse_1.5s_infinite]' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
