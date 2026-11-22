import React from 'react';

export const Loader = ({ size = 'md', message = '', className = '' }) => {
  const sizeStyles = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500 ${sizeStyles[size]}`}
      />
      {message && (
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
};

export default Loader;
