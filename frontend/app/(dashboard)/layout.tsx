'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Once auth state is resolved, redirect unauthenticated users to login
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Show full-page spinner while auth state is being resolved
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page">
        <Loader2 size={32} className="animate-spin text-[#714b67]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page flex">
      {/* Sidebar (fixed) */}
      <Sidebar collapsed={collapsed} toggleCollapsed={() => setCollapsed(!collapsed)} />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          collapsed ? "pl-16" : "pl-60"
        )}
      >
        <Topbar collapsed={collapsed} />

        <main className="mt-14 px-6 py-6 max-w-[1280px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
