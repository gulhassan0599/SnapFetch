import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/80 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
        <div className="text-center">
          &copy; {new Date().getFullYear()} SnapFetch, All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
