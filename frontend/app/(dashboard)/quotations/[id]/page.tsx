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
    convertedToSubscription?: boolean;
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

    async function handleReview(action: 'accept' | 'reject' | 'counter') {
        if (!quotation?._id && !quotation?.id) return;
        setIsActionLoading(true);
        try {
            let counterAmount: number | undefined;
            let note = '';

            if (action === 'counter') {
                const current = Number(quotation.totalAmount ?? quotation.grandTotal ?? 0);
                const next = window.prompt('Enter revised total amount (INR)', String(current));
                if (next === null) {
                    setIsActionLoading(false);
                    return;
                }
                const parsed = Number(next);
                if (!Number.isFinite(parsed) || parsed < 0) {
                    toastError('Invalid amount', 'Please enter a valid non-negative amount');
                    setIsActionLoading(false);
                    return;
                }
                counterAmount = parsed;
                note = window.prompt('Optional note for customer') || '';
            }

            await api.quotations.review(quotation._id || quotation.id, { action, counterAmount, note });
            success(`Quotation ${action}ed`);
            await fetchQuotation();
        } catch (err: unknown) {
            toastError('Review failed', getErrorMessage(err, 'Could not update quotation'));
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleClose() {
        if (!quotation?._id && !quotation?.id) return;
        const reason = window.prompt('Reason for closing this quotation (optional)') || '';
        setIsActionLoading(true);
        try {
            await api.quotations.close(quotation._id || quotation.id, { reason });
            success('Quotation closed');
            await fetchQuotation();
        } catch (err: unknown) {
            toastError('Close failed', getErrorMessage(err, 'Could not close quotation'));
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleUpsell() {
        if (!quotation?._id && !quotation?.id) return;
        const current = Number(quotation.totalAmount ?? quotation.grandTotal ?? 0);
        const next = window.prompt('Enter upsell total amount (INR)', String(current));
        if (next === null) return;
        const parsed = Number(next);
        if (!Number.isFinite(parsed) || parsed < 0) {
            toastError('Invalid amount', 'Please enter a valid non-negative amount');
            return;
        }
        const note = window.prompt('Upsell note (optional)') || '';

        setIsActionLoading(true);
        try {
            await api.quotations.upsell(quotation._id || quotation.id, { targetAmount: parsed, note });
            success('Upsell quotation created');
            await fetchQuotation();
        } catch (err: unknown) {
            toastError('Upsell failed', getErrorMessage(err, 'Could not create upsell quotation'));
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
    const isConverted = Boolean(quotation.convertedToSubscription);
    const isOverdue = Boolean(quotation.validUntil || quotation.expiryDate)
        && ['draft', 'sent'].includes(status)
        && new Date(quotation.validUntil || quotation.expiryDate || '').getTime() < Date.now();

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
                        disabled={isActionLoading || status !== 'accepted' || isConverted}
                        className="px-4 py-2 rounded-btn bg-success-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-success-700 disabled:opacity-60"
                    >
                        <span className="inline-flex items-center gap-2"><CheckCircle2 size={14} /> {isConverted ? 'Converted' : 'Convert'}</span>
                    </button>
                    <button
                        onClick={() => handleReview('accept')}
                        disabled={isActionLoading || status === 'accepted' || status === 'rejected' || status === 'expired'}
                        className="px-4 py-2 rounded-btn bg-success-600/10 text-success-700 text-xs font-bold uppercase tracking-widest hover:bg-success-600 hover:text-white disabled:opacity-60"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleReview('counter')}
                        disabled={isActionLoading || status === 'rejected' || status === 'expired'}
                        className="px-4 py-2 rounded-btn bg-warning-600/10 text-warning-700 text-xs font-bold uppercase tracking-widest hover:bg-warning-600 hover:text-white disabled:opacity-60"
                    >
                        Counter
                    </button>
                    <button
                        onClick={() => handleReview('reject')}
                        disabled={isActionLoading || status === 'rejected' || status === 'expired'}
                        className="px-4 py-2 rounded-btn bg-danger-600/10 text-danger-700 text-xs font-bold uppercase tracking-widest hover:bg-danger-600 hover:text-white disabled:opacity-60"
                    >
                        Reject
                    </button>
                    <button
                        onClick={handleUpsell}
                        disabled={isActionLoading || status === 'closed' || status === 'expired' || status === 'rejected'}
                        className="px-4 py-2 rounded-btn bg-plano-600/10 text-plano-700 text-xs font-bold uppercase tracking-widest hover:bg-plano-600 hover:text-white disabled:opacity-60"
                    >
                        Upsell
                    </button>
                    <button
                        onClick={handleClose}
                        disabled={isActionLoading || status === 'closed' || status === 'expired' || status === 'rejected'}
                        className="px-4 py-2 rounded-btn bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest hover:bg-gray-300 disabled:opacity-60"
                    >
                        Close
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
                        {isOverdue ? <p className="text-[10px] font-bold uppercase tracking-widest text-danger-600 mt-1">Overdue</p> : null}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Currency</p>
                        <p className="text-sm font-semibold text-text-primary mt-1">INR</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</p>
                        <p className="text-lg font-serif font-bold text-text-primary mt-1">{formatCurrency(total, 'INR')}</p>
                    </div>
                    {isConverted ? (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subscription</p>
                            <p className="text-sm font-semibold text-success-600 mt-1">Already converted</p>
                        </div>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
