'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalNavbar from '@/components/portal/PortalNavbar';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { isAdminRole, isPortalRole, defaultRouteForRole } from '@/lib/role-routing';
import Script from 'next/script';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // FIX [M6]: Redirect non-portal users away from /portal
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login?next=/portal');
      return;
    }

    // Admin/internal users should go to their admin dashboard
    if (isAdminRole(user.role)) {
      router.replace(defaultRouteForRole(user.role));
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || !isPortalRole(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page">
        <Loader2 size={32} className="animate-spin text-plano-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-page selection:bg-plano-100 selection:text-plano-900">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <PortalNavbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
