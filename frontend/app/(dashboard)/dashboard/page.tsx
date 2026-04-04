import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-plano-600" /></div>}>
            <DashboardClient />
        </Suspense>
    );
}
