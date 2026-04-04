'use client';

import React from 'react';
import PortalNavbar from '@/components/portal/PortalNavbar';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
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
