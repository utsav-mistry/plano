'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefreshCw, CheckCircle2, AlertTriangle, Receipt, CreditCard, Clock3 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { toAdminPath } from '@/lib/path-scoping';
import { CheckoutAuditEvent } from '@/types';

export default function PaymentsAuditPage() {
    const pathname = usePathname();
    const [events, setEvents] = useState<CheckoutAuditEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAudit();
    }, []);

    async function fetchAudit() {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.payments.getCheckoutAudit({ limit: 40 });
            const payload = res.data as { events?: CheckoutAuditEvent[] };
            setEvents(Array.isArray(payload?.events) ? payload.events : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load checkout audit');
        } finally {
            setIsLoading(false);
        }
    }

    const stats = useMemo(() => {
        const total = events.length;
        const complete = events.filter((e) => e.dbChainComplete).length;
        const pending = total - complete;
        return { total, complete, pending };
    }, [events]);

    return (
        <div className="flex flex-col gap-6 pb-12">
            <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl text-text-primary">Checkout Audit</h1>
                    <p className="text-sm text-text-secondary font-medium tracking-wide">
                        Quick verification that every checkout reached subscription, invoice, and payment tables.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={toAdminPath(pathname, '/payments')}
                        className="px-4 h-10 rounded-input border border-border dark:border-sidebar-hover text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-sidebar-hover transition-colors flex items-center"
                    >
                        Back To Payments
                    </Link>
                    <button
                        onClick={fetchAudit}
                        className="px-4 h-10 rounded-input bg-plano-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-plano-700 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={14} className={cn(isLoading && 'animate-spin')} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-card border border-border dark:border-sidebar-hover bg-bg-surface p-4">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Events</p>
                    <p className="text-2xl font-bold text-text-primary mt-2">{stats.total}</p>
                </div>
                <div className="rounded-card border border-border dark:border-sidebar-hover bg-bg-surface p-4">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">DB Chain Complete</p>
                    <p className="text-2xl font-bold text-success-600 mt-2">{stats.complete}</p>
                </div>
                <div className="rounded-card border border-border dark:border-sidebar-hover bg-bg-surface p-4">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Needs Attention</p>
                    <p className="text-2xl font-bold text-danger-600 mt-2">{stats.pending}</p>
                </div>
            </div>

            <div className="bg-bg-surface rounded-card border border-border dark:border-sidebar-hover overflow-hidden shadow-sm min-h-[420px]">
                {isLoading ? (
                    <div className="h-[420px] flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
                        Loading checkout audit...
                    </div>
                ) : error ? (
                    <div className="h-[420px] flex items-center justify-center text-sm font-bold text-danger-600 px-6 text-center">
                        {error}
                    </div>
                ) : events.length === 0 ? (
                    <div className="h-[420px] flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
                        No checkout events found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border dark:border-sidebar-hover bg-gray-50/60 dark:bg-white/10">
                                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Chain</th>
                                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Customer / Plan</th>
                                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Invoice</th>
                                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Payment</th>
                                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Amount</th>
                                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-sidebar-hover">
                                {events.map((event) => (
                                    <tr key={event.subscriptionId} className="hover:bg-gray-25 dark:hover:bg-white/10">
                                        <td className="py-3 px-4">
                                            <span className={cn(
                                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
                                                event.dbChainComplete
                                                    ? 'bg-success-50 text-success-700 border-success-200'
                                                    : 'bg-danger-50 text-danger-700 border-danger-200'
                                            )}>
                                                {event.dbChainComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                                {event.dbChainComplete ? 'OK' : 'Gap'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm font-semibold text-text-primary">{event.customerName}</div>
                                            <div className="text-[11px] text-gray-500">{event.planName}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {event.invoiceId ? (
                                                <Link
                                                    href={toAdminPath(pathname, `/invoices/${event.invoiceId}`)}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-plano-600 hover:underline"
                                                >
                                                    <Receipt size={12} />
                                                    {event.invoiceNumber || 'Invoice'}
                                                </Link>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Missing</span>
                                            )}
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{event.invoiceStatus || '-'}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {event.paymentId ? (
                                                <div>
                                                    <div className="inline-flex items-center gap-1 text-xs font-bold text-text-primary">
                                                        <CreditCard size={12} />
                                                        {event.paymentGateway || 'gateway'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-mono mt-1">{event.paymentReference || '-'}</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">{event.paymentStatus || '-'}</div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Missing</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-bold text-text-primary">
                                            {formatCurrency(event.amount || 0, event.currency || 'INR')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                                                <Clock3 size={12} />
                                                {event.subscriptionCreatedAt ? new Date(event.subscriptionCreatedAt).toLocaleString() : '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
