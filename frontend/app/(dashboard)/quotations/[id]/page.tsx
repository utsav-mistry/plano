'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { toAdminPath } from '@/lib/path-scoping';
import { Quotation } from '@/types';

type QuotationData = Quotation & {
    _id?: string;
    validUntil?: string;
    expiryDate?: string;
    status?: string;
    grandTotal?: number;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

export default function QuotationDetailPage() {
    const params = useParams();
    const pathname = usePathname();
    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
    const { success, error: toastError } = useToast();

    const [quotation, setQuotation] = useState<QuotationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQuotation = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.quotations.getById(id);
            if (res.success) {
                const data = res.data as { quotation?: QuotationData } | QuotationData;
                if (typeof data === 'object' && data !== null && 'quotation' in data) {
                    setQuotation((data as { quotation?: QuotationData }).quotation ?? null);
                } else {
                    setQuotation(data as QuotationData);
                }
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load quotation'));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchQuotation();
    }, [fetchQuotation]);

    async function handleSend() {
        if (!quotation?._id && !quotation?.id) return;
        setIsActionLoading(true);
        try {
            await api.quotations.send(quotation._id || quotation.id);
            success('Quotation sent to customer');
            await fetchQuotation();
        } catch (err: unknown) {
            toastError('Send failed', getErrorMessage(err, 'Could not send quotation'));
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleConvert() {
        if (!quotation?._id && !quotation?.id) return;
        setIsActionLoading(true);
        try {
            await api.quotations.convert(quotation._id || quotation.id);
            success('Quotation converted to subscription');
            await fetchQuotation();
        } catch (err: unknown) {
            toastError('Convert failed', getErrorMessage(err, 'Could not convert quotation'));
        } finally {
            setIsActionLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-[360px] flex items-center justify-center gap-3 text-text-secondary">
                <Loader2 className="w-6 h-6 animate-spin text-plano-600" />
                <span className="text-sm font-medium">Loading quotation...</span>
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="min-h-[360px] flex flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="w-10 h-10 text-danger-500" />
                <p className="text-sm font-bold text-text-primary">{error || 'Quotation not found'}</p>
                <Link href={toAdminPath(pathname, '/quotations')} className="text-xs font-bold text-plano-600 underline uppercase tracking-widest">
                    Back to Quotations
                </Link>
            </div>
        );
    }

    const total = quotation.totalAmount ?? quotation.grandTotal ?? 0;
    const status = quotation.status || 'draft';

    return (
        <div className="flex flex-col gap-6 pb-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={toAdminPath(pathname, '/quotations')} className="p-2 rounded-full border border-border hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={18} className="text-gray-500" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-serif font-bold text-text-primary">{quotation.quotationNumber || `QUO-${(quotation._id || quotation.id || '').toString().slice(-6).toUpperCase()}`}</h1>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Status: {status}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSend}
                        disabled={isActionLoading || status !== 'draft'}
                        className="px-4 py-2 rounded-btn bg-plano-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-plano-700 disabled:opacity-60"
                    >
                        <span className="inline-flex items-center gap-2"><Send size={14} /> Send</span>
                    </button>
                    <button
                        onClick={handleConvert}
                        disabled={isActionLoading || status !== 'accepted'}
                        className="px-4 py-2 rounded-btn bg-success-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-success-700 disabled:opacity-60"
                    >
                        <span className="inline-flex items-center gap-2"><CheckCircle2 size={14} /> Convert</span>
                    </button>
                </div>
            </div>

            <section className="bg-bg-surface rounded-card border border-border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">{typeof quotation.userId === 'object' ? quotation.userId?.name : 'Customer'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Valid Until</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">{quotation.validUntil || quotation.expiryDate ? new Date(quotation.validUntil || quotation.expiryDate).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Currency</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">INR</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</p>
                        <p className="text-lg font-serif font-bold text-text-primary mt-1">{formatCurrency(total, 'INR')}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
