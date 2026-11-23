import React from 'react';
import { FaHeart } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/80 py-8 pb-24 sm:pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400 space-y-1.5">
        <div className="flex items-center justify-center text-slate-700 dark:text-slate-300">
          <span>Made with</span>
          <FaHeart className="mx-1.5 text-red-500 text-xs inline-block" aria-label="love" />
          <span>by <span className="font-bold text-slate-900 dark:text-white">Gul Hassan</span></span>
        </div>
        <div className="text-center text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} SnapFetch, All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
