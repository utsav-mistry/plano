'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, ChevronDown, Package, LogOut, LayoutDashboard, Settings, CreditCard, Search, Command, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import CommandPalette from '@/components/portal/CommandPalette';

export default function PortalNavbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const cartItems = useCartStore((s: { items: { quantity: number }[] }) => s.items);
  const cartCount = cartItems.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => { 
    logout(); 
    router.push('/login'); 
  };

  const navLinks = [
    { label: 'Home', href: '/portal' },
    { label: 'Shop', href: '/portal/shop' },
    { label: 'My Account', href: '/portal/account/profile', protected: true },
  ];

  const profileLinks = [
    { label: 'User Details', href: '/portal/account/profile', icon: User },
    { label: 'My Orders', href: '/portal/account/orders', icon: Package },
    { label: 'My Quotes', href: '/portal/quotes', icon: CreditCard },
    { label: 'My Reports', href: '/portal/reports', icon: Calculator },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, adminOnly: true },
  ];

  return (
    <nav className="sticky top-0 z-[100] border-b border-plano-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-12">
          <Link href="/portal" className="flex items-center gap-2 group">
             <div className="w-8 h-8 bg-plano-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                <span className="font-caveat text-white text-xl font-bold leading-none">P</span>
             </div>
             <span className="font-caveat text-2xl font-bold text-plano-900 tracking-tight">Plano</span>
          </Link>

          <div className="hidden md:flex gap-8 text-sm font-semibold">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.label} 
                  href={link.href}
                  className={cn(
                    "relative py-1 transition-colors hover:text-plano-600",
                    isActive ? "text-plano-900" : "text-gray-500"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill" 
                      className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-plano-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Cart + Profile */}
        <div className="flex items-center gap-4">
          <CommandPalette />
          
          {/* Cart */}
          <Link 
            href="/portal/cart" 
            className="group relative h-10 px-4 rounded-full border border-plano-100 flex items-center gap-2 transition-all hover:border-plano-200 hover:bg-plano-50"
          >
            <ShoppingCart size={18} className="text-plano-600" />
            <span className="text-sm font-bold text-plano-900 hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-plano-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(o => !o)}
                className="h-10 pl-3 pr-4 rounded-full border border-plano-100 flex items-center gap-2 transition-all hover:border-plano-200 hover:bg-plano-50"
              >
                <div className="w-6 h-6 rounded-full bg-plano-100 flex items-center justify-center">
                  <User size={14} className="text-plano-600" />
                </div>
                <span className="text-sm font-bold text-plano-900 truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className={cn("text-gray-400 transition-transform", profileOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-plano-50 overflow-hidden z-20"
                    >
                      <div className="p-4 border-b border-plano-50 bg-plano-50/10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-plano-900 truncate">{user.name}</p>
                        <p className="text-xs font-medium text-gray-400 truncate">{user.email}</p>
                      </div>

                      <div className="p-2">
                        {profileLinks.map((item) => {
                          // FIX [AUDIT-C1]: Backend roles are lowercase — compare against 'admin'
                          if (item.adminOnly && user.role !== 'admin') return null;
                          return (
                            <Link 
                              key={item.label} 
                              href={item.href}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-plano-50 hover:text-plano-600 transition-all group"
                            >
                              <item.icon size={18} className="text-gray-300 group-hover:text-plano-400 transition-colors" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="p-2 border-t border-plano-50">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-danger-500 hover:bg-danger-50 transition-all group"
                        >
                          <LogOut size={18} className="text-danger-300 group-hover:text-danger-400" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="h-10 px-6 rounded-full bg-plano-600 text-white text-sm font-bold transition-all hover:bg-plano-900 hover:shadow-lg hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
