'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  CalendarClock, 
  FileText, 
  FileSignature, 
  Receipt, 
  CreditCard, 
  TicketPercent, 
  Percent, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Recurring Plans', href: '/plans', icon: CalendarClock },
    ],
  },
  {
    label: 'Billing',
    items: [
      { name: 'Subscriptions', href: '/subscriptions', icon: FileText },
      { name: 'Quotation Templates', href: '/quotations', icon: FileSignature },
      { name: 'Invoices', href: '/invoices', icon: Receipt },
      { name: 'Payments', href: '/payments', icon: CreditCard },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Discounts', href: '/discounts', icon: TicketPercent },
      { name: 'Tax Management', href: '/taxes', icon: Percent },
    ],
  },
  {
    label: 'Administration',
    items: [
      { name: 'Users & Contacts', href: '/users', icon: Users },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
];

export default function Sidebar({ collapsed, toggleCollapsed }: { collapsed: boolean; toggleCollapsed: () => void }) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "bg-sidebar-bg text-sidebar-text flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-hover">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[32px] h-8 bg-plano-600 rounded flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          {!collapsed && (
            <span className="font-serif text-xl font-bold text-white whitespace-nowrap">Plano</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h3 className="px-3 mb-2 text-[10px] uppercase tracking-widest text-sidebar-muted font-semibold">
                {group.label}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-btn font-sans text-sm transition-colors",
                      isActive 
                        ? "bg-plano-600 text-white" 
                        : "text-sidebar-text hover:bg-sidebar-hover"
                    )}
                  >
                    <item.icon size={18} className={cn(isActive ? "text-white" : "text-sidebar-muted")} />
                    {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User / Bottom */}
      <div className="p-4 border-t border-sidebar-hover">
        {collapsed ? (
          <div className="flex flex-col items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-plano-500 flex items-center justify-center text-xs font-bold">RM</div>
             <button onClick={toggleCollapsed} className="p-1 hover:bg-sidebar-hover rounded"><ChevronRight size={16} /></button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-plano-500 flex items-center justify-center text-xs font-bold">RM</div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">Ravi Mistry</span>
                <span className="text-[10px] text-sidebar-muted">Admin</span>
              </div>
            </div>
            <button onClick={toggleCollapsed} className="p-1 hover:bg-sidebar-hover rounded text-sidebar-muted"><ChevronLeft size={16} /></button>
          </div>
        )}
      </div>
    </aside>
  );
}
