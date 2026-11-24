import React, { useEffect } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { FiYoutube } from 'react-icons/fi';
import { SiTiktok, SiFacebook, SiX } from 'react-icons/si';
import { FiInstagram } from 'react-icons/fi';
import { Button } from './Button';

export const YouTubeNoticeModal = ({ isOpen, onClose }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="yt-notice-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Close dialog"
        >
          <FiX size={18} />
        </button>

        <div className="space-y-5">
          {/* Header with Icon and Badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-500 flex items-center justify-center shrink-0">
              <FiYoutube size={26} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/50">
                <FiAlertTriangle size={12} /> Maintenance Notice
              </span>
              <h3 id="yt-notice-title" className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                YouTube Downloads Paused
              </h3>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <p>
              YouTube downloading is currently non-functional due to automated datacenter bot restrictions on our cloud hosting provider.
            </p>
            <p>
              Our team is working on a stable proxy solution. In the meantime, downloads are <span className="text-slate-900 dark:text-white font-semibold">100% active and working</span> for our other platforms:
            </p>
          </div>

          {/* Supported Platforms Pills */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <SiTiktok size={16} className="text-slate-900 dark:text-white" />
              <span>TikTok</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" title="Active" />
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <FiInstagram size={16} className="text-pink-500" />
              <span>Instagram</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" title="Active" />
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <SiFacebook size={16} className="text-blue-600" />
              <span>Facebook</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" title="Active" />
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <SiX size={15} className="text-slate-900 dark:text-white" />
              <span>X (Twitter)</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" title="Active" />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              onClick={onClose}
              className="w-full font-bold justify-center py-2.5"
            >
              Got it, continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeNoticeModal;
