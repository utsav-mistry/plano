'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { defaultRouteForRole, isAdminRole } from '@/lib/role-routing';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { cn } from '@/lib/utils';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace('/login?next=/admin');
            return;
        }

        if (!isAdminRole(user.role)) {
            router.replace(defaultRouteForRole(user.role));
        }
    }, [isLoading, user, router]);

    if (isLoading || !user || !isAdminRole(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-page">
                <Loader2 size={32} className="animate-spin text-[#714b67]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-page flex">
            <Sidebar collapsed={collapsed} toggleCollapsed={() => setCollapsed(!collapsed)} />

            <div
                className={cn(
                    'flex-1 flex flex-col transition-all duration-300',
                    collapsed ? 'pl-16' : 'pl-60'
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
