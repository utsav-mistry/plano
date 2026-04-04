'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSignature, Plus, Search, Edit2, ExternalLink,
  Clock, AlertCircle, Loader2, FileText
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const { error: toastError, success } = useToast();

  useEffect(() => { fetchQuotations(); }, []);

  async function fetchQuotations() {
    setIsLoading(true); setError(null);
    try {
      const res = await api.quotations.getAll();
      if (res.success) {
        const d = res.data as any;
        setQuotations(d.quotations ?? d ?? []);
      }
    } catch (err: any) { setError(err.message || 'Failed to load quotations'); }
    finally { setIsLoading(false); }
  }

  async function handleSend(id: string) {
    try {
      await api.quotations.send(id);
      success('Quotation sent to customer');
      fetchQuotations();
    } catch (err: any) { toastError('Failed to send', err.message); }
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
        <Link href="/quotations/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm">
          <Plus size={18} /> New Quotation
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 bg-bg-surface p-4 rounded-card border border-border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search quotations..."
            className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:outline-none transition-all text-sm font-sans" />
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
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
            <FileText size={32} />
          </div>
          <p className="text-lg font-serif font-bold text-text-primary">No quotations yet</p>
          <p className="text-xs text-text-secondary font-medium">Create your first quotation to send to a customer.</p>
          <Link href="/quotations/new"
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn font-bold shadow-sm">
            <Plus size={16} /> New Quotation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotations.map((q: any) => (
            <div key={q._id}
              className="bg-bg-surface border border-border rounded-card p-6 flex flex-col gap-5 hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-plano-50 text-plano-600 flex items-center justify-center">
                    <FileSignature size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-sans font-bold text-text-primary group-hover:text-plano-600 transition-colors line-clamp-1">
                      {q.title || `QUO-${q._id?.slice(-6).toUpperCase()}`}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                      <Clock size={10} className="text-warning-500" />
                      Valid {q.validFor ?? 30} days
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                  ${q.status === 'accepted' ? 'bg-success-50 text-success-700'
                    : q.status === 'sent' ? 'bg-info-50 text-info-700'
                    : q.status === 'expired' ? 'bg-danger-50 text-danger-700'
                    : 'bg-gray-100 text-gray-500'}`}>
                  {q.status ?? 'draft'}
                </span>
              </div>

              <div className="flex flex-col gap-2 py-4 border-y border-gray-100">
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
                  {formatCurrency(q.grandTotal || q.totalAmount || 0, q.currency || 'INR')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {q.status === 'draft' && (
                  <button onClick={() => handleSend(q._id)}
                    className="px-4 py-2 bg-plano-600/10 text-plano-600 rounded-btn text-[11px] font-bold uppercase tracking-widest hover:bg-plano-600 hover:text-white transition-all">
                    Send to Customer
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <Link href={`/quotations/${q._id}`}
                    className="p-2 rounded-btn border border-border bg-white text-gray-400 hover:text-plano-600 transition-all">
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
