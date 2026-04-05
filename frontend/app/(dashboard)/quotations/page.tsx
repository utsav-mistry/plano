'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileSignature, Plus, Search, Edit2, ExternalLink,
  Clock, AlertCircle, Loader2, FileText
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Quotation } from '@/types';
import { toAdminPath } from '@/lib/path-scoping';

export default function QuotationsPage() {
  const pathname = usePathname();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: toastError, success } = useToast();

  useEffect(() => { fetchQuotations(); }, []);

  async function fetchQuotations() {
    setIsLoading(true); setError(null);
    try {
      const res = await api.quotations.getAll();
      if (res.success) {
        const d = res.data as { quotations?: Quotation[] } | Quotation[];
        setQuotations(Array.isArray(d) ? d : (d.quotations ?? []));
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to load quotations'); }
    finally { setIsLoading(false); }
  }

  async function handleSend(id: string) {
    try {
      await api.quotations.send(id);
      success('Quotation sent to customer');
      fetchQuotations();
    } catch (err: unknown) { toastError('Failed to send', err instanceof Error ? err.message : 'Failed to send'); }
  }

  async function handleReview(id: string, action: 'accept' | 'reject' | 'counter', currentTotal: number) {
    try {
      let counterAmount: number | undefined;
      let note = '';

      if (action === 'counter') {
        const next = window.prompt('Enter revised total amount (INR)', String(currentTotal || 0));
        if (next === null) return;
        const parsed = Number(next);
        if (!Number.isFinite(parsed) || parsed < 0) {
          toastError('Invalid amount', 'Please enter a valid non-negative amount.');
          return;
        }
        counterAmount = parsed;
        note = window.prompt('Optional note for customer') || '';
      }

      await api.quotations.review(id, { action, counterAmount, note });
      success(`Quotation ${action}ed`);
      fetchQuotations();
    } catch (err: unknown) {
      toastError('Review failed', err instanceof Error ? err.message : 'Failed to update quotation');
    }
  }

  async function handleClose(id: string) {
    const reason = window.prompt('Reason for closing this quotation (optional)') || '';
    try {
      await api.quotations.close(id, { reason });
      success('Quotation closed');
      fetchQuotations();
    } catch (err: unknown) {
      toastError('Close failed', err instanceof Error ? err.message : 'Failed to close quotation');
    }
  }

  async function handleUpsell(id: string, currentTotal: number) {
    const next = window.prompt('Enter upsell total amount (INR)', String(currentTotal || 0));
    if (next === null) return;
    const parsed = Number(next);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toastError('Invalid amount', 'Please enter a valid non-negative amount.');
      return;
    }
    const note = window.prompt('Upsell note (optional)') || '';
    try {
      await api.quotations.upsell(id, { targetAmount: parsed, note });
      success('Upsell quotation created');
      fetchQuotations();
    } catch (err: unknown) {
      toastError('Upsell failed', err instanceof Error ? err.message : 'Failed to create upsell quotation');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Quotations</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
            Send proposals to customers before activating subscriptions.
          </p>
        </div>
        <Link href={toAdminPath(pathname, '/quotations/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm">
          <Plus size={18} /> New Quotation
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 bg-bg-surface p-4 rounded-card border border-border dark:border-sidebar-hover shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search quotations..."
            className="w-full h-10 pl-10 pr-4 rounded-input border border-border dark:border-sidebar-hover bg-gray-25 dark:bg-bg-page focus:border-plano-500 dark:focus:bg-white/10 focus:outline-none transition-all text-sm font-sans text-text-primary" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 size={22} className="animate-spin text-plano-600" />
          <span className="text-sm font-medium text-text-secondary">Loading quotations...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <AlertCircle size={32} className="text-danger-400" />
          <p className="text-sm font-bold text-danger-600">{error}</p>
          <button onClick={fetchQuotations} className="text-xs font-bold text-plano-600 underline">Retry</button>
        </div>
      ) : quotations.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300">
            <FileText size={32} />
          </div>
          <p className="text-lg font-serif font-bold text-text-primary">No quotations yet</p>
          <p className="text-xs text-text-secondary font-medium">Create your first quotation to send to a customer.</p>
          <Link href={toAdminPath(pathname, '/quotations/new')}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn font-bold shadow-sm">
            <Plus size={16} /> New Quotation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotations.map((q) => (
            <div key={q.id}
              className="bg-bg-surface border border-border dark:border-sidebar-hover rounded-card p-6 flex flex-col gap-5 hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-plano-50 dark:bg-white/10 text-plano-600 dark:text-plano-400 flex items-center justify-center border border-plano-100 dark:border-white/5">
                    <FileSignature size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-sans font-bold text-text-primary group-hover:text-plano-600 transition-colors line-clamp-1">
                      {q.quotationNumber || `QUO-${q.id?.slice(-6).toUpperCase()}`}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                      <Clock size={10} className="text-warning-500" />
                      Valid until {q.expiryDate ? new Date(q.expiryDate).toLocaleDateString() : '30 days'}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${q.status === 'accepted' ? 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-500 border-success-200 dark:border-success-800'
                  : q.status === 'sent' ? 'bg-info-50 dark:bg-info-900/20 text-info-700 dark:text-info-500 border-info-200 dark:border-info-800'
                    : q.status === 'closed' ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10'
                      : q.status === 'expired' ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-500 border-danger-200 dark:border-danger-800'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10'}`}>
                  {q.status ?? 'draft'}
                </span>
              </div>

              <div className="flex flex-col gap-2 py-4 border-y border-border dark:border-sidebar-hover">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Customer</span>
                  <span className="text-xs font-bold text-text-primary">
                    {typeof q.userId === 'object' ? q.userId?.name : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Plan</span>
                  <span className="text-xs font-bold text-text-primary">
                    {typeof q.planId === 'object' ? q.planId?.name : '—'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total</span>
                <span className="text-2xl font-serif font-bold text-text-primary">
                  {formatCurrency(q.totalAmount || 0, q.currency || 'INR')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {q.status === 'draft' && (
                  <button onClick={() => handleSend(q.id)}
                    className="px-4 py-2 bg-plano-600/10 text-plano-600 rounded-btn text-[11px] font-bold uppercase tracking-widest hover:bg-plano-600 hover:text-white transition-all">
                    Send to Customer
                  </button>
                )}
                {q.status === 'sent' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReview(q.id, 'accept', q.totalAmount || 0)}
                      className="px-3 py-2 rounded-btn bg-success-600/10 text-success-700 text-[10px] font-bold uppercase tracking-widest hover:bg-success-600 hover:text-white transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReview(q.id, 'counter', q.totalAmount || 0)}
                      className="px-3 py-2 rounded-btn bg-warning-600/10 text-warning-700 text-[10px] font-bold uppercase tracking-widest hover:bg-warning-600 hover:text-white transition-all"
                    >
                      Counter
                    </button>
                    <button
                      onClick={() => handleReview(q.id, 'reject', q.totalAmount || 0)}
                      className="px-3 py-2 rounded-btn bg-danger-600/10 text-danger-700 text-[10px] font-bold uppercase tracking-widest hover:bg-danger-600 hover:text-white transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {q.status !== 'closed' && q.status !== 'expired' && q.status !== 'rejected' && (
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => handleUpsell(q.id, q.totalAmount || 0)}
                      className="px-3 py-2 rounded-btn bg-plano-600/10 text-plano-700 text-[10px] font-bold uppercase tracking-widest hover:bg-plano-600 hover:text-white transition-all"
                    >
                      Upsell
                    </button>
                    <button
                      onClick={() => handleClose(q.id)}
                      className="px-3 py-2 rounded-btn bg-gray-200 text-gray-700 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-300 transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <Link href={toAdminPath(pathname, `/quotations/${q.id}`)}
                    className="p-2 rounded-btn border border-border dark:border-sidebar-hover bg-bg-surface text-gray-400 hover:text-plano-600 dark:hover:text-plano-400 hover:bg-plano-50 dark:hover:bg-white/10 transition-all">
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
