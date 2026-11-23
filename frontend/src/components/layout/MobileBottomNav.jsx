import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiDownloadCloud, FiPlusCircle } from 'react-icons/fi';

export const MobileBottomNav = () => {
  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: FiHome,
    },
    {
      to: '/download',
      label: 'Download',
      icon: FiDownloadCloud,
    },
    {
      to: '/request-platform',
      label: 'Add Platform',
      icon: FiPlusCircle,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 sm:hidden bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.35)] px-3 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] transition-colors duration-300"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`relative p-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100/80 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 scale-105'
                      : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={20} className="stroke-[2.2]" />
                </span>
                <span className="text-[11px] tracking-tight mt-0.5 select-none leading-tight">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
