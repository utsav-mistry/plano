'use client';

import React from 'react';
import { Search, Bell, Moon, Sun, User, LogOut, Settings as SettingsIcon, ChevronDown, Package, LayoutGrid, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { Product } from '@/types';

export default function Topbar({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const routePrefix = pathname.startsWith('/admin') ? '/admin' : '';
  // FIX [AUDIT-M3]: Initialize dark mode from localStorage to persist preference across refreshes
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('plano-dark-mode') === 'true';
    }
    return false;
  });
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [platformKey, setPlatformKey] = React.useState('Ctrl');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [realProducts, setRealProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Static navigation suggestions
  const navSuggestions = [
    { title: 'Overview Dashboard', icon: <LayoutGrid size={14} />, href: '/dashboard' },
    { title: 'My Subscriptions', icon: <Bell size={14} />, href: '/subscriptions' },
    { title: 'Payment History', icon: <SettingsIcon size={14} />, href: '/invoices' },
    { title: 'Account Profile', icon: <User size={14} />, href: '/profile' },
  ]
    .map(item => ({ ...item, href: `${routePrefix}${item.href}` }))
    .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Fetch real products from backend
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setRealProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.products.getAll({ search: searchQuery, limit: 5 });
        if (response.success && (response.data as any).products) {
          setRealProducts((response.data as any).products);
        } else if (response.success && Array.isArray(response.data)) {
          setRealProducts(response.data);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    // Detect platform for keyboard shortcuts
    const isMac = typeof window !== 'undefined' && navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    setPlatformKey(isMac ? '⌘' : 'Ctrl');

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // FIX [AUDIT-M3]: Persist dark mode preference to localStorage
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('plano-dark-mode', String(next));
  };

  // FIX [AUDIT-M3]: Restore dark mode class on mount from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('plano-dark-mode') === 'true';
    if (stored) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <header
      className={cn(
        "h-14 bg-bg-surface border-b border-sidebar-hover fixed top-0 right-0 z-40 flex items-center justify-between px-6 transition-all duration-300",
        collapsed ? "left-16" : "left-60"
      )}
    >
      {/* Search / Left Side */}
      <div className="flex-1 max-w-sm">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-plano-400 transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search anything..."
            className="w-full bg-gray-50 dark:bg-white/5 border border-border dark:border-sidebar-hover focus:border-plano-400 dark:focus:bg-white/10 rounded-input h-9 pl-10 pr-16 text-xs outline-none transition-all placeholder:text-gray-400 text-text-primary"
          />
          <div className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none transition-all",
            (isFocused || searchQuery) ? "opacity-0 invisible" : "opacity-100 visible"
          )}>
            <kbd className="h-5 px-1.5 flex items-center justify-center bg-bg-surface border border-border dark:border-sidebar-hover rounded text-[10px] font-mono font-bold text-gray-400 shadow-sm">{platformKey}</kbd>
            <kbd className="h-5 px-1.5 flex items-center justify-center bg-bg-surface border border-border dark:border-sidebar-hover rounded text-[10px] font-mono font-bold text-gray-400 shadow-sm">K</kbd>
          </div>

          {/* Search Suggestions Dropdown */}
          {isFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated rounded-xl shadow-2xl border border-sidebar-hover py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

              {/* Navigation Section */}
              {navSuggestions.length > 0 && (
                <>
                  <div className="px-3 py-1.5 border-b border-gray-50 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Navigation</span>
                  </div>
                  <div className="py-1">
                    {navSuggestions.map((item, idx) => (
                      <Link
                        key={`nav-${idx}`}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-plano-50 transition-colors group"
                        onClick={() => {
                          setSearchQuery('');
                          setIsFocused(false);
                        }}
                      >
                        <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-plano-100 group-hover:text-plano-600 transition-colors">
                          {item.icon}
                        </div>
                        <span className="text-xs font-bold text-text-secondary group-hover:text-plano-700">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* Products Section */}
              <div className="px-3 py-1.5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Products</span>
                {isLoading && <Loader2 size={12} className="animate-spin text-plano-500" />}
              </div>

              <div className="py-1 min-h-[40px]">
                {realProducts.length > 0 ? (
                  realProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`${routePrefix}/products/${product.id}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-plano-50 transition-colors group"
                      onClick={() => {
                        setSearchQuery('');
                        setIsFocused(false);
                      }}
                    >
                      <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-plano-100 group-hover:text-plano-600 transition-colors">
                        <Package size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-secondary group-hover:text-plano-700">{product.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{product.basePrice} {product.currency}</span>
                      </div>
                    </Link>
                  ))
                ) : !isLoading && (
                  <div className="px-4 py-4 text-center text-gray-400">
                    <p className="text-[10px] uppercase font-bold tracking-wider">No products found</p>
                  </div>
                )}
                {isLoading && realProducts.length === 0 && (
                  <div className="px-4 py-4 text-center text-gray-400">
                    <p className="text-[10px] uppercase font-bold tracking-wider animate-pulse">Searching...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2 rounded-btn hover:bg-sidebar-hover relative text-gray-500">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger-500 rounded-full border-2 border-bg-surface"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-btn hover:bg-sidebar-hover text-gray-500"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="h-8 w-px bg-sidebar-hover mx-1"></div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer group hover:bg-sidebar-hover px-2 py-1 rounded-lg transition-colors border border-transparent"
          >
            <div className="flex flex-col items-end">
              <span className="text-xs font-sans font-bold text-text-primary uppercase tracking-tight">{user?.name || 'User'}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{user?.role || 'Admin'}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-sidebar-hover flex items-center justify-center text-plano-300 text-xs font-bold border border-sidebar-hover uppercase">
              {user?.name.charAt(0) || 'U'}
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-bg-elevated rounded-card shadow-xl border border-sidebar-hover z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-sidebar-hover">
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-text-primary truncate">{user?.email || 'user@plano.app'}</p>
                </div>

                <div className="py-1">
                  <Link
                    href={`${routePrefix}/profile`}
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] text-text-secondary hover:bg-sidebar-hover font-bold uppercase tracking-widest transition-colors"
                  >
                    <User size={14} className="text-plano-400" /> Profile
                  </Link>
                  <Link
                    href={`${routePrefix}/settings`}
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] text-text-secondary hover:bg-sidebar-hover font-bold uppercase tracking-widest transition-colors"
                  >
                    <SettingsIcon size={14} className="text-plano-400" /> settings
                  </Link>
                </div>

                <div className="border-t border-sidebar-hover pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 font-bold uppercase tracking-widest"
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
