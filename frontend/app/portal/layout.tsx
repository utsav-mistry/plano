'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { defaultRouteForRole, isPortalRole } from '@/lib/role-routing';

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isPortalRoot = pathname === '/portal';

    useEffect(() => {
        if (isPortalRoot) return;
        if (isLoading) return;

        if (!user) {
            router.replace('/login?next=/portal');
            return;
        }

        if (!isPortalRole(user.role)) {
            router.replace(defaultRouteForRole(user.role));
        }
    }, [isLoading, user, router, isPortalRoot]);

    if (isPortalRoot) {
        return <>{children}</>;
    }

    if (isLoading || !user || !isPortalRole(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-page">
                <Loader2 size={32} className="animate-spin text-[#714b67]" />
            </div>
        );
    }

    return <>{children}</>;
}
