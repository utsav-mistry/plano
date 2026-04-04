'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  ArrowLeft,
  Save,
  Info,
  FileText,
  IndianRupee,
  Check,
  Loader2,
  ChevronDown,
  Calendar,
  Zap,
  LayoutDashboard,
  UserCircle,
  FileCheck,
  ShieldCheck,
  Eye,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export default function NewQuotationPage() {
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [form, setForm] = useState({
    userId: '',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'INR',
    items: [] as any[],
    notes: '',
  });

  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: '1',
    unitPrice: '',
  });

  useEffect(() => {
    async function loadDeps() {
      try {
        const [uRes, pRes] = await Promise.all([
          api.users.getAll(),
          api.products.getAll(),
        ]);
        if (uRes.success) setUsers((uRes.data as any).users ?? uRes.data ?? []);
        if (pRes.success) setProducts((pRes.data as any).products ?? pRes.data ?? []);
      } catch (err) {
        console.error('Failed to load dependencies', err);
      } finally {
        setLoadingDeps(false);
      }
    }
    loadDeps();
  }, []);

  const handleProductSelect = (id: string) => {
    const prod = products.find(p => p._id === id);
    if (prod) {
      setCurrentItem({
        ...currentItem,
        productId: id,
        unitPrice: prod.basePrice.toString(),
      });
    }
  };

  const addItem = () => {
    if (!currentItem.productId || !currentItem.quantity) return;
    const prod = products.find(p => p._id === currentItem.productId);
    setForm(p => ({
      ...p,
      items: [...p.items, {
        productId: currentItem.productId,
        quantity: Number(currentItem.quantity),
        unitPrice: Number(currentItem.unitPrice),
        name: prod?.name
      }]
    }));
    setCurrentItem({ productId: '', quantity: '1', unitPrice: '' });
  };

  const removeItem = (idx: number) => {
    setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  };

  const subtotal = form.items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || form.items.length === 0) {
      toastError('Validation', 'Please select a customer and add at least one item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.quotations.create({
        ...form,
        validUntil: new Date(form.validUntil).toISOString(),
      });
      if (res.success) {
        success('Quote issued!', 'Quotation generated and sent to customer directory.');
        window.location.href = '/admin/quotations';
      }
    } catch (err: any) {
      toastError('Generation failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "text-[11px] uppercase font-bold text-gray-500 tracking-widest mb-1.5 flex items-center gap-1.5";
  const inputStyle = "w-full h-11 px-4 rounded-lg border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans shadow-sm";

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/quotations" className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-plano-600 transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Quotes
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl text-text-primary">Draft New Quotation</h1>
            <p className="text-sm text-text-secondary font-medium uppercase tracking-[0.2em] text-[10px]">
              Catalog / Quotations / Create
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: Quote Details */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Section 1: Parties involved */}
          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8 relative overflow-hidden">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 relative">
              <div className="w-10 h-10 rounded-xl bg-plano-50 text-plano-600 flex items-center justify-center border border-plano-100 shadow-sm">
                <UserCircle size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">Customer Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className={labelStyle}>Select Recipient *</label>
                <div className="relative">
                  <select
                    suppressHydrationWarning
                    required
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    className={cn(inputStyle, "appearance-none pr-10 cursor-pointer")}
                  >
                    <option value="">Search internal/portal users...</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  {loadingDeps ? (
                    <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-300" />
                  ) : (
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>Validity Period *</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className={cn(inputStyle, "pl-11 pr-4 font-mono")}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Items Configuration */}
          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center border border-success-100 shadow-sm">
                <Plus size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">Line Items</h2>
            </div>

            {/* Add Item Row */}
            <div className="p-6 bg-gray-50 rounded-xl border border-border flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 flex flex-col">
                  <label className={labelStyle}>Product</label>
                  <select
                    suppressHydrationWarning
                    value={currentItem.productId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">Select offering...</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <label className={labelStyle}>Qty</label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                    className={inputStyle}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col">
                  <label className={labelStyle}>Unit Rate</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold pr-2 border-r border-gray-100 mr-2">₹</div>
                    <input
                      suppressHydrationWarning
                      type="number"
                      placeholder="0.00"
                      value={currentItem.unitPrice}
                      onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: e.target.value })}
                      className={cn(inputStyle, "pl-11 font-mono")}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="h-12 w-full rounded-lg bg-plano-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add to Quote
              </button>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Selected Item</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center">Unit Price</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center whitespace-nowrap">Qty</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Total</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {form.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">No items drafted yet</p>
                      </td>
                    </tr>
                  ) : (
                    form.items.map((item, i) => (
                      <tr key={i} className="group hover:bg-gray-25 transition-colors">
                        <td className="py-4 px-6">
                          <span className="text-sm font-bold text-text-primary">{item.name}</span>
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-xs text-text-primary">
                          {formatCurrency(item.unitPrice, form.currency)}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-xs text-text-secondary">
                          {item.quantity}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-sm text-text-primary">
                          {formatCurrency(item.unitPrice * item.quantity, form.currency)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button type="button" onClick={() => removeItem(i)} className="p-2 rounded-lg text-gray-300 hover:text-danger-600 hover:bg-danger-50 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Notes & T&C */}
          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-6">
            <label className={labelStyle}>Internal Notes & Terms</label>
            <textarea
              rows={4}
              placeholder="Payment terms, special discounts, or scope of work details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={cn(inputStyle, "h-32 py-4 resize-none")}
            />
          </section>
        </div>

        {/* Right Sidebar: Totals & Preview */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Summary Card */}
          <div className="bg-plano-900 p-8 rounded-card border border-plano-800 shadow-2xl flex flex-col gap-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
              <FileCheck size={120} className="-rotate-12" />
            </div>

            <div className="flex flex-col gap-1 relative">
              <span className="text-[10px] font-bold text-plano-400 uppercase tracking-widest border border-plano-800 rounded-full px-3 py-1 w-fit bg-plano-950">Draft Quote</span>
              <h3 className="text-3xl font-serif font-bold text-white mt-4">Fiscal Summary</h3>
            </div>

            <div className="flex flex-col gap-5 border-t border-plano-800/50 pt-8 relative">
              <div className="flex items-center justify-between text-sm">
                <span className="text-plano-400 font-bold uppercase tracking-widest text-[10px]">Gross Subtotal</span>
                <span className="font-mono font-bold text-lg">{formatCurrency(subtotal, form.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-plano-400 font-bold uppercase tracking-widest text-[10px]">Taxes & Levies</span>
                <span className="font-mono font-bold text-lg">{formatCurrency(0, form.currency)}</span>
              </div>

              <div className="bg-plano-800/40 p-5 rounded-xl border border-plano-700/50 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase text-white shadow-none">Total Value</span>
                    <span className="text-[10px] text-plano-400 font-medium">Billed to customer</span>
                  </div>
                  <span className="text-3xl font-serif font-bold text-white">
                    {formatCurrency(subtotal, form.currency).split('.')[0]}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 relative">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full rounded-xl bg-white text-plano-950 font-bold text-sm shadow-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                {isSubmitting ? 'Issuing Quote...' : 'Issue Performance Quote'}
              </button>
              <button type="button" className="text-[10px] font-bold text-plano-400 uppercase tracking-widest hover:text-white transition-colors text-center">
                Preview Full PDF Document
              </button>
            </div>
          </div>

          {/* Logistics Info Box */}
          <div className="bg-white p-6 rounded-card border border-border flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-info-50 flex items-center justify-center text-info-600 shrink-0">
                <Info size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <h5 className="text-xs font-bold text-text-primary uppercase tracking-tight">Financial Policy</h5>
                <p className="text-[10px] text-text-secondary leading-relaxed font-medium">
                  Quotations are legally binding documents once accepted by the customer.
                  Ensure line items matched agreed-upon negotiations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
