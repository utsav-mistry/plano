'use client';

import React from 'react';
import { Search, Bell, Moon, Sun, User, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';

export default function Topbar({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

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
      <div className="flex-1 max-w-sm">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-plano-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything... (⌘K)" 
            className="w-full bg-gray-50 border border-border focus:border-plano-400 focus:bg-white rounded-input h-9 pl-10 pr-4 text-xs outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2 rounded-btn hover:bg-gray-50 relative text-gray-500">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-btn hover:bg-gray-50 text-gray-500"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="h-8 w-px bg-border mx-1"></div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors border border-transparent"
          >
            <div className="flex flex-col items-end">
              <span className="text-xs font-sans font-bold text-text-primary uppercase tracking-tight">{user?.name || 'User'}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{user?.role || 'Admin'}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-plano-100 flex items-center justify-center text-plano-700 text-xs font-bold border border-plano-200 uppercase">
              {user?.name.charAt(0) || 'U'}
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-card shadow-xl border border-border z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-text-primary truncate">{user?.email || 'user@plano.app'}</p>
                </div>
                
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-secondary hover:bg-gray-50 font-bold uppercase tracking-widest">
                    <User size={14} /> Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-secondary hover:bg-gray-50 font-bold uppercase tracking-widest">
                    <SettingsIcon size={14} /> settings
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-danger-600 hover:bg-danger-50 font-bold uppercase tracking-widest"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
