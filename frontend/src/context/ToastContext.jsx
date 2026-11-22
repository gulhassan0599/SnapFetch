import React, { createContext, useContext, useState, useCallback } from "react";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
} from "react-icons/fi";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Automatically remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <FiCheckCircle className="text-green-500" size={18} />,
    error: <FiAlertCircle className="text-red-500" size={18} />,
    warning: <FiAlertTriangle className="text-yellow-500" size={18} />,
    info: <FiInfo className="text-blue-500" size={18} />,
  };

  const bgColors = {
    success:
      "bg-white dark:bg-slate-900 border-green-200/55 dark:border-green-950/20 shadow-green-100/40 dark:shadow-slate-950",
    error:
      "bg-white dark:bg-slate-900 border-red-200/55 dark:border-red-950/20 shadow-red-100/40 dark:shadow-slate-950",
    warning:
      "bg-white dark:bg-slate-900 border-yellow-200/55 dark:border-yellow-950/20 shadow-yellow-100/40 dark:shadow-slate-950",
    info: "bg-white dark:bg-slate-900 border-blue-200/55 dark:border-blue-950/20 shadow-blue-100/40 dark:shadow-slate-950",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast rendering portal */}
      <div className="fixed bottom-5 right-5 z-9999 flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-300 animate-fade-in ${bgColors[t.type]}`}
          >
            <div className="mt-0.5">{icons[t.type]}</div>
            <div className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 wrap-break-words pr-2">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors p-0.5"
              aria-label="Close Notification"
            >
              <FiX size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
