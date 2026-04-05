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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { toAdminPath } from '@/lib/path-scoping';
import BrandLogo from '@/components/branding/BrandLogo';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        "bg-sidebar-bg text-sidebar-text flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 border-r border-white/5",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-hover">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[32px] h-8 bg-white/5 rounded flex items-center justify-center">
            <BrandLogo variant="mark" className="text-[20px]" />
          </div>
          {!collapsed && (
            <BrandLogo variant="dark" textClassName="text-[27px] whitespace-nowrap" />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 no-scrollbar">
        {navGroups.map((group, idx) => (
          <React.Fragment key={idx}>
            <div className="mb-4">
              {!collapsed && (
                <h3 className="px-3 mb-1.5 text-[10px] uppercase tracking-widest text-sidebar-muted font-semibold">
                  {group.label}
                </h3>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const scopedHref = toAdminPath(pathname, item.href);
                  const isActive = pathname === scopedHref || pathname.startsWith(`${scopedHref}/`);
                  return (
                    <Link
                      key={item.name}
                      href={scopedHref}
                      className={cn(
                        "flex items-center gap-3 px-3 py-1.5 rounded-btn font-sans text-sm transition-colors",
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
            {idx < navGroups.length - 1 && (
              <div className="h-px bg-sidebar-hover/30 mx-3 my-4" />
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* User / Bottom */}
      <div className="p-4 border-t border-sidebar-hover">
        {collapsed ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-plano-500 flex items-center justify-center text-xs font-bold uppercase">{user?.name?.charAt(0) || 'U'}</div>
            <button onClick={toggleCollapsed} className="p-1 hover:bg-sidebar-hover rounded"><ChevronRight size={16} /></button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-plano-500 flex items-center justify-center text-xs font-bold border border-white/20 uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium truncate max-w-[100px]">{user?.name || 'Authorized User'}</span>
                <span className="text-[10px] text-sidebar-muted uppercase font-bold tracking-widest">{user?.role || 'Operator'}</span>
              </div>
            </div>
            <button onClick={toggleCollapsed} className="p-1 hover:bg-sidebar-hover rounded text-sidebar-muted"><ChevronLeft size={16} /></button>
          </div>
        )}
      </div>
    </aside>
  );
}
