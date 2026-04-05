'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Download,
    RefreshCw,
    XCircle,
    Package,
    Calendar,
    MapPin,
    FileText,
    CheckCircle2,
    ChevronRight,
    Loader2,
    ShieldCheck,
    AlertCircle,
    Clock,
    Info,
    Printer,
    Pause,
    Play,
    Star,
    ArrowUpRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { Subscription, Invoice } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { toAdminPath } from '@/lib/path-scoping';
import { cn } from '@/lib/utils';

function getCycleProgress(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
    return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
}

export default function AdminSubscriptionDetailPage() {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const subscriptionId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
    const { success, error: toastError } = useToast();

    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActing, setIsActing] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [subRes, invRes] = await Promise.all([
                    api.subscriptions.getById(subscriptionId),
                    api.invoices.getAll({ subscriptionId }),
                ]);

                if (subRes.success) {
                    const data = subRes.data as Subscription | { subscription?: Subscription };
                    setSubscription((data as { subscription?: Subscription }).subscription ?? (data as Subscription));
                }

                if (invRes.success) {
                    const data = invRes.data as { invoices?: Invoice[] } | Invoice[];
                    setInvoices(Array.isArray(data) ? data : (data.invoices ?? []));
                }
            } catch (err) {
                toastError('Unable to load subscription', err instanceof Error ? err.message : 'The requested subscription was not found.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [subscriptionId, toastError]);

    const handleRefresh = async () => {
        setIsActing(true);
        try {
            const [subRes, invRes] = await Promise.all([
                api.subscriptions.getById(subscriptionId),
                api.invoices.getAll({ subscriptionId }),
            ]);
            if (subRes.success) {
                const data = subRes.data as Subscription | { subscription?: Subscription };
                setSubscription((data as { subscription?: Subscription }).subscription ?? (data as Subscription));
            }
            if (invRes.success) {
                const data = invRes.data as { invoices?: Invoice[] } | Invoice[];
                setInvoices(Array.isArray(data) ? data : (data.invoices ?? []));
            }
            success('Refreshed', 'Subscription data has been reloaded.');
        } catch (err) {
            toastError('Refresh failed', err instanceof Error ? err.message : 'Unable to reload subscription.');
        } finally {
            setIsActing(false);
        }
    };

    const handleConfirm = async () => {
        if (!subscription) return;
        setIsActing(true);
        try {
            const res = await api.subscriptions.confirm(subscription.id);
            if (res.success) {
                success('Subscription confirmed', 'The subscription is now active.');
                await handleRefresh();
            }
        } catch (err) {
            toastError('Confirm failed', err instanceof Error ? err.message : 'Unable to confirm subscription.');
        } finally {
            setIsActing(false);
        }
    };

    const handlePause = async () => {
        if (!subscription) return;
        setIsActing(true);
        try {
            const res = await api.subscriptions.pause(subscription.id);
            if (res.success) {
                success('Paused', 'Subscription has been paused.');
                await handleRefresh();
            }
        } catch (err) {
            toastError('Pause failed', err instanceof Error ? err.message : 'Unable to pause subscription.');
        } finally {
            setIsActing(false);
        }
    };

    const handleResume = async () => {
        if (!subscription) return;
        setIsActing(true);
        try {
            const res = await api.subscriptions.resume(subscription.id);
            if (res.success) {
                success('Resumed', 'Subscription has been resumed.');
                await handleRefresh();
            }
        } catch (err) {
            toastError('Resume failed', err instanceof Error ? err.message : 'Unable to resume subscription.');
        } finally {
            setIsActing(false);
        }
    };

    const handleCancel = async () => {
        if (!subscription) return;
        const reason = window.prompt('Reason for cancelling this subscription (optional)') || 'Cancelled by admin';
        setIsActing(true);
        try {
            const res = await api.subscriptions.cancel(subscription.id, reason);
            if (res.success) {
                success('Subscription cancelled', 'The subscription has been cancelled.');
                await handleRefresh();
            }
        } catch (err) {
            toastError('Cancel failed', err instanceof Error ? err.message : 'Unable to cancel subscription.');
        } finally {
            setIsActing(false);
        }
    };

    const handleToggleAutoRenew = async () => {
        if (!subscription) return;
        setIsActing(true);
        try {
            const res = await api.subscriptions.update(subscription.id, { autoRenew: !subscription.autoRenew });
            if (res.success) {
                success(subscription.autoRenew ? 'Auto-renew disabled' : 'Auto-renew enabled');
                await handleRefresh();
            }
        } catch (err) {
            toastError('Auto-renew update failed', err instanceof Error ? err.message : 'Unable to update subscription.');
        } finally {
            setIsActing(false);
        }
    };

    const handleDownloadInvoice = async (invoiceId: string) => {
        try {
            const response = await api.invoices.downloadPdf(invoiceId);
            if (!response.ok) throw new Error('Failed to download invoice');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${invoiceId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            success('Download started', 'Your invoice PDF is being generated.');
        } catch (err) {
            toastError('Download failed', err instanceof Error ? err.message : 'Could not generate the invoice PDF.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[360px] flex items-center justify-center gap-3 text-text-secondary">
                <Loader2 className="w-6 h-6 animate-spin text-plano-600" />
                <span className="text-sm font-medium">Loading subscription...</span>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="min-h-[360px] flex flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="w-10 h-10 text-danger-500" />
                <p className="text-sm font-bold text-text-primary">Subscription not found</p>
                <Link href={toAdminPath(pathname, '/subscriptions')} className="text-xs font-bold text-plano-600 underline uppercase tracking-widest">
                    Back to Subscriptions
                </Link>
            </div>
        );
    }

    const productName = typeof subscription.productId === 'object' ? subscription.productId.name : 'Subscription Package';
    const planName = typeof subscription.planId === 'object' ? subscription.planId.name : 'Plan details';
    const planCycle = typeof subscription.planId === 'object' ? subscription.planId.billingCycle : 'recurring';
    const cycleProgress = getCycleProgress(subscription.startDate, subscription.endDate);
    const isOverdue = ['expired', 'cancelled'].includes(subscription.status) ? false : new Date(subscription.endDate).getTime() < Date.now();

    const latestInvoice = invoices[0];

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        <Link href={toAdminPath(pathname, '/subscriptions')} className="hover:text-plano-600 transition-colors uppercase">All Subscriptions</Link>
                        <ChevronRight size={10} />
                        <span className="text-plano-900 font-mono tracking-widest">{subscription.id}</span>
                    </nav>
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-plano-900 uppercase tracking-tighter leading-none italic">{productName}</h1>
                        <div className={cn(
                            'px-4 py-1.5 rounded-2xl border flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white shadow-sm',
                            subscription.status === 'active' ? 'text-success-600 border-success-100' : subscription.status === 'paused' ? 'text-warning-600 border-warning-100' : subscription.status === 'cancelled' ? 'text-danger-500 border-danger-100' : 'text-gray-400 border-gray-100'
                        )}>
                            <div className={cn('w-2 h-2 rounded-full', subscription.status === 'active' ? 'bg-success-600 animate-pulse' : subscription.status === 'paused' ? 'bg-warning-500' : 'bg-gray-300')} />
                            {subscription.status}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {subscription.status !== 'active' && subscription.status !== 'cancelled' && (
                        <button
                            onClick={handleConfirm}
                            disabled={isActing}
                            className="h-14 px-8 rounded-2xl bg-plano-600 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-plano-900 shadow-xl shadow-plano-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isActing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                            Confirm
                        </button>
                    )}

                    <button
                        onClick={handleToggleAutoRenew}
                        disabled={isActing || subscription.status === 'cancelled'}
                        className={cn(
                            'h-14 px-8 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
                            subscription.autoRenew
                                ? 'border border-success-100 bg-success-50/40 text-success-700 hover:bg-success-50'
                                : 'border border-gray-200 bg-white text-gray-500 hover:border-plano-300 hover:text-plano-600'
                        )}
                    >
                        <RefreshCw size={18} />
                        {subscription.autoRenew ? 'Auto-renew ON' : 'Auto-renew OFF'}
                    </button>

                    {subscription.status === 'active' && (
                        <button
                            onClick={handlePause}
                            disabled={isActing}
                            className="h-14 px-8 rounded-2xl border border-warning-100 bg-warning-50/20 text-warning-600 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-warning-50 transition-all shadow-sm disabled:opacity-50"
                        >
                            <Pause size={18} />
                            Pause
                        </button>
                    )}

                    {subscription.status === 'paused' && (
                        <button
                            onClick={handleResume}
                            disabled={isActing}
                            className="h-14 px-8 rounded-2xl bg-success-600 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-success-700 transition-all shadow-lg shadow-success-600/20 disabled:opacity-50"
                        >
                            <Play size={18} />
                            Resume
                        </button>
                    )}

                    {subscription.status !== 'cancelled' && (
                        <button
                            onClick={handleCancel}
                            disabled={isActing}
                            className="h-14 px-8 rounded-2xl border border-danger-100 text-danger-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-danger-50 shadow-sm transition-all disabled:opacity-50"
                        >
                            {isActing ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
                            Cancel Service
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 border-b border-plano-50">
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Package size={14} className="text-plano-300" />
                                Subscription Overview
                            </h3>
                            <div className="p-8 rounded-[2.5rem] bg-white border border-plano-50 shadow-sm relative overflow-hidden group hover:border-plano-200 transition-all">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <CheckCircle2 size={64} className="text-success-600" />
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Plan</p>
                                <h4 className="text-2xl font-bold text-plano-900 uppercase tracking-tight mb-6">{planName}</h4>

                                <div className="mb-6 flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-1 rounded-full bg-plano-50 border border-plano-100 text-[10px] font-bold uppercase tracking-widest text-plano-600">
                                        {planCycle} cycle
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                                        {subscription.autoRenew ? 'Auto-renew enabled' : 'Auto-renew off'}
                                    </span>
                                    {isOverdue ? (
                                        <span className="text-[10px] font-bold text-danger-600 uppercase tracking-widest">Overdue</span>
                                    ) : null}
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cycle Progress</span>
                                        <span className="text-[10px] font-bold text-plano-600 tabular-nums">{cycleProgress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-plano-50 overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full bg-gradient-to-r from-plano-500 to-plano-600 transition-all',
                                                subscription.status === 'paused' ? 'from-warning-400 to-warning-500' : subscription.status === 'cancelled' ? 'from-gray-300 to-gray-400' : ''
                                            )}
                                            style={{ width: `${cycleProgress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 opacity-60">Created Date</span>
                                        <span className="text-xs font-bold text-plano-900">{format(new Date(subscription.startDate), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 opacity-60">End Period</span>
                                        <span className="text-xs font-bold text-plano-900">{format(new Date(subscription.endDate), 'MMM dd, yyyy')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <MapPin size={14} className="text-plano-300" />
                                Account Info
                            </h3>
                            <div className="p-8 rounded-[2.5rem] border border-plano-100 bg-plano-50/20 relative group hover:bg-white transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-plano-50 flex items-center justify-center text-plano-600 shadow-sm">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-plano-900">Customer and Access</h4>
                                </div>
                                <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-tighter">
                                    {typeof subscription.userId === 'object' ? `${subscription.userId.name} • ${subscription.userId.email}` : subscription.userId}
                                    <br />
                                    Subscription ID: {subscription.id}
                                    <br />
                                    Admin view can manage activation, billing state, and renewal controls.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-plano-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <FileText size={18} className="text-plano-600" />
                            Transaction Statements
                        </h3>
                        <div className="bg-white rounded-[2.5rem] border border-plano-100 overflow-hidden shadow-xl shadow-plano-600/5">
                            <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 bg-plano-50/30 border-b border-plano-50">
                                <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inv Number</div>
                                <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</div>
                                <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</div>
                                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</div>
                                <div className="col-span-1" />
                            </div>

                            <div className="divide-y divide-plano-50">
                                {invoices.length > 0 ? invoices.map((inv) => (
                                    <div
                                        key={inv.id}
                                        className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-8 lg:px-8 lg:py-6 items-center hover:bg-plano-50 transition-all group"
                                    >
                                        <div className="col-span-12 lg:col-span-3 flex items-center gap-4">
                                            <span className="text-sm font-bold text-plano-900 font-mono tracking-widest uppercase group-hover:text-plano-600 transition-colors">{inv.invoiceNumber}</span>
                                        </div>
                                        <div className="col-span-6 lg:col-span-3 text-sm font-medium text-gray-500">
                                            {format(new Date(inv.issueDate), 'MMM dd, yyyy')}
                                        </div>
                                        <div className="col-span-6 lg:col-span-3">
                                            {inv.status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-success-600 uppercase tracking-widest bg-success-50 px-3 py-1 rounded-full border border-success-100"><CheckCircle2 size={12} strokeWidth={3} /> Paid</span>
                                            ) : inv.status === 'overdue' ? (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-danger-500 uppercase tracking-widest bg-danger-50 px-3 py-1 rounded-full border border-danger-100"><AlertCircle size={12} strokeWidth={3} /> Overdue</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100"><Clock size={12} strokeWidth={3} /> {inv.status}</span>
                                            )}
                                        </div>
                                        <div className="col-span-6 lg:col-span-2 text-right text-lg font-bold text-plano-900 tabular-nums">
                                            ₹{inv.totalAmount.toLocaleString()}
                                        </div>
                                        <div className="col-span-6 lg:col-span-1 flex items-center justify-end gap-2">
                                            {latestInvoice?.id === inv.id ? (
                                                <button
                                                    onClick={() => handleDownloadInvoice(inv.id)}
                                                    className="p-2 rounded-btn border border-border dark:border-sidebar-hover bg-bg-surface text-gray-400 hover:text-plano-600 transition-all"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-gray-400 font-medium italic">No invoices found for this subscription yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 sticky top-28 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-plano-100 p-8 shadow-xl shadow-plano-600/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-plano-600">
                            <Star size={64} fill="currentColor" stroke="none" />
                        </div>

                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2 underline underline-offset-8 decoration-plano-200 decoration-4">
                            Purchase Statement
                        </h3>

                        <div className="space-y-6">
                            <div className="pb-6 border-b border-plano-50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 italic">Itemized Costs</p>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-plano-50 border border-plano-100 flex items-center justify-center text-plano-600 flex-shrink-0">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-plano-900 uppercase leading-tight line-clamp-2">{productName}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">QTY: {subscription.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="text-md font-bold text-plano-900 tabular-nums">₹{subscription.unitPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Untaxed Amount</span>
                                    <span className="text-plano-900 tabular-nums">₹{subscription.totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Tax Calculation</span>
                                    <span className="text-plano-900 tabular-nums">₹{subscription.taxApplied.toLocaleString()}</span>
                                </div>
                                {subscription.discountApplied > 0 && (
                                    <div className="flex justify-between items-center text-xs font-bold text-success-600 uppercase tracking-widest bg-success-50 p-3 rounded-2xl border border-success-100">
                                        <span>Discount Applied</span>
                                        <span className="text-lg font-bold">−₹{subscription.discountApplied.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="h-px bg-plano-50 w-full" />
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-plano-600 uppercase tracking-[0.2em] mb-1 shadow-sm px-2 bg-plano-50 rounded">Bill Period Total</span>
                                    <span className="text-4xl font-bold text-plano-900 tabular-nums">₹{subscription.grandTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-plano-50/50 rounded-3xl flex gap-4 border border-plano-50">
                            <Info size={18} className="text-plano-600 flex-shrink-0" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-widest">
                                Subscriptions are billed upfront. Any changes in plan or early closure may lead to credit adjustments on your next cycle.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={isActing}
                        className="w-full h-14 rounded-2xl bg-white border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:border-plano-600 hover:shadow-lg transition-all shadow-sm disabled:opacity-50"
                    >
                        {isActing ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />}
                        Refresh View
                    </button>

                    <button
                        onClick={() => router.push(toAdminPath(pathname, '/subscriptions'))}
                        className="w-full h-14 rounded-2xl border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:border-plano-600 hover:bg-plano-50 transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        Back to Subscriptions
                    </button>
                </div>
            </div>
        </div>
    );
}
