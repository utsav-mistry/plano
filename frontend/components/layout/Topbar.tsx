'use client';

import React from 'react';
import { Search, Bell, Moon, Sun, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Topbar({ collapsed }: { collapsed: boolean }) {
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header 
      className={cn(
        "h-14 bg-white border-b border-border fixed top-0 right-0 z-40 flex items-center justify-between px-6 transition-all duration-300",
        collapsed ? "left-16" : "left-60"
      )}
    >
      {/* Search / Left Side */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-input bg-gray-50 border border-border text-gray-400 hover:border-border-strong transition-all focus:outline-none">
          <Search size={16} />
          <span className="text-xs font-sans">Search anything... (⌘K)</span>
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2 rounded-btn hover:bg-gray-50 relative text-gray-500">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-btn hover:bg-gray-50 text-gray-500"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="h-8 w-px bg-border mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-sans font-medium text-text-primary">Ravi Mistry</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Admin</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-plano-100 flex items-center justify-center text-plano-700 text-xs font-bold border border-plano-200">
            RM
          </div>
        </div>
      </div>
    </header>
  );
}
