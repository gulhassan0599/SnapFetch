import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700/60 ${className}`}
      {...props}
    />
  );
};

export const SkeletonText = ({ lines = 1, className = '', ...props }) => {
  return (
    <div className={`space-y-2.5 ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse"
          style={{ width: i === lines - 1 && lines > 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
};

export const SkeletonThumbnail = ({ className = '', ...props }) => {
  return (
    <div
      className={`aspect-video rounded-xl bg-slate-200 dark:bg-slate-700/60 animate-pulse ${className}`}
      {...props}
    />
  );
};

export const SkeletonCard = ({ className = '', ...props }) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-6 p-6 border border-slate-200/50 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 ${className}`} {...props}>
      <SkeletonThumbnail className="w-full sm:w-48 shrink-0" />
      <div className="grow space-y-4 py-1">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <SkeletonText lines={2} />
        <div className="flex space-x-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
