import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon size={18} aria-hidden="true" />
          </div>
        )}
        <input
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`block w-full rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 text-sm py-2.5 ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } ${
            error ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500 dark:border-red-500' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-500 font-semibold">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
