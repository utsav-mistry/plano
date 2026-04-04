import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import InvoiceDetailClient from './InvoiceDetailClient';

export default function InvoiceDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-plano-600" /></div>}>
            <InvoiceDetailClient />
        </Suspense>
    );
}
