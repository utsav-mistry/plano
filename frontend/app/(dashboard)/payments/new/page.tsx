'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ChevronDown, Check, Info, Banknote, Calendar } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash Entry' },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export default function RecordPaymentPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [form, setForm] = useState({
    invoiceId: '',
    userId: '',
    amount: '',
    currency: 'INR',
    paymentMethod: 'bank_transfer',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    async function loadDeps() {
      try {
        const res = await api.invoices.getAll({ status: 'confirmed' });
        if (res.success) {
          const data = res.data as any;
          setInvoices(data.invoices ?? data ?? []);
        }
      } catch (err) {
        console.error('Failed to load invoices', err);
      } finally {
        setLoadingDeps(false);
      }
    }
    loadDeps();
  }, []);

  const handleInvoiceChange = (id: string) => {
    const inv = invoices.find(i => i._id === id);
    if (inv) {
      setForm(p => ({
        ...p,
        invoiceId: id,
        userId: typeof inv.userId === 'object' ? inv.userId._id : inv.userId,
        amount: inv.totalAmount.toString(),
        currency: inv.currency || 'INR'
      }));
    } else {
      setForm(p => ({ ...p, invoiceId: id }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) {
      toastError('Validation', 'Please provide an amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.payments.record({
        ...form,
        amount: Number(form.amount)
      });
      if (res.success) {
        success('Payment recorded!', 'Transaction successfully logged and reconciled.');
        router.push('/payments');
      }
    } catch (err: any) {
      toastError('Submission failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = 'h-11 px-4 rounded-lg border border-border bg-gray-25 text-sm font-medium outline-none transition-all focus:border-plano-500 focus:bg-white w-full shadow-sm';
  const label = 'text-[11px] uppercase font-bold tracking-widest text-gray-500 mb-1.5 flex items-center gap-1.5';

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link 
          href="/payments"
          className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-plano-600 transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to Payments
        </Link>
        <h1 className="text-4xl text-text-primary">Record Payment</h1>
        <p className="text-sm text-text-secondary font-medium tracking-wide">
          Log a collection or reconcile a standalone transaction.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8">
        
        {/* Source Invoice Selection */}
        <div className="flex flex-col">
          <label className={label}>Reference Invoice (Optional)</label>
          <div className="relative">
            <select
              value={form.invoiceId}
              onChange={e => handleInvoiceChange(e.target.value)}
              className={cn(field, "appearance-none pr-10 cursor-pointer")}
              disabled={loadingDeps}
            >
              <option value="">Select an invoice to auto-fill...</option>
              {invoices.map((inv) => (
                <option key={inv._id} value={inv._id}>
                  INV-{inv.invoiceNumber} — {typeof inv.userId === 'object' ? inv.userId?.name : 'Customer'} (₹{inv.totalAmount})
                </option>
              ))}
            </select>
            {loadingDeps ? (
              <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-300" />
            ) : (
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <label className={label}>Payment Amount *</label>
            <div className="relative">
              <Banknote size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input 
                suppressHydrationWarning
                required
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                className={cn(field, "pl-11 font-mono font-bold text-lg")}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className={label}>Currency</label>
            <div className="relative">
              <select
                value={form.currency}
                onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                className={cn(field, "appearance-none pr-10 cursor-pointer")}
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Method & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <label className={label}>Payment Method</label>
            <div className="relative">
              <select
                value={form.paymentMethod}
                onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}
                className={cn(field, "appearance-none pr-10 cursor-pointer")}
              >
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col">
            <label className={label}>Payment Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input 
                suppressHydrationWarning
                type="date"
                value={form.paymentDate}
                onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))}
                className={cn(field, "pl-11 pr-4")}
              />
            </div>
          </div>
        </div>

        {/* Transaction ID */}
        <div className="flex flex-col">
          <label className={label}>Transaction ID / Reference #</label>
          <input 
            suppressHydrationWarning
            type="text"
            placeholder="e.g. TXN-9981-A2"
            value={form.transactionId}
            onChange={e => setForm(p => ({ ...p, transactionId: e.target.value.toUpperCase() }))}
            className={cn(field, "uppercase font-mono")}
          />
          <p className="text-[10px] text-gray-400 font-medium mt-1.5 flex items-center gap-1.5 ml-1">
            <Info size={10} />
            Optional but recommended for reconciliation.
          </p>
        </div>

        {/* Notes */}
        <div className="flex flex-col">
          <label className={label}>Internal Notes</label>
          <textarea 
            rows={3}
            placeholder="Any internal context for this payment..."
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className="w-full p-4 rounded-lg border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans resize-none shadow-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
          <button 
            suppressHydrationWarning
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl bg-plano-600 text-white font-bold hover:bg-plano-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {isSubmitting ? 'Recording Entry...' : 'Record Payment'}
          </button>
          <Link 
            href="/payments"
            className="px-8 h-12 rounded-xl border border-border bg-white text-sm font-bold text-text-secondary hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
