'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Root route handler.
 * - Authenticated   → /dashboard
 * - Unauthenticated → /login
 *
 * This file must exist here to satisfy Next.js (app/page.tsx).
 * The real dashboard lives at /dashboard via (dashboard)/dashboard/page.tsx.
 */
export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="animate-spin" style={{ color: '#714b67' }} />
    </div>
  );
}
