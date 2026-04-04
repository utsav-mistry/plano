'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TicketPercent, Plus, Search, Edit2, Trash2,
  Power, Calendar, AlertCircle, Loader2, FileText
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  useEffect(() => { fetchDiscounts(); }, []);

  async function fetchDiscounts() {
    setIsLoading(true); setError(null);
    try {
      const res = await api.discounts.getAll();
      if (res.success) {
        const d = res.data as any;
        setDiscounts(d.discounts ?? d ?? []);
      }
    } catch (err: any) { setError(err.message || 'Failed to load discounts'); }
    finally { setIsLoading(false); }
  }

  async function handleToggle(id: string) {
    try {
      await api.discounts.toggle(id);
      success('Discount status updated');
      fetchDiscounts();
    } catch (err: any) { toastError('Failed', err.message); }
  }

  async function handleDelete(id: string) {
    try {
      await api.discounts.delete(id);
      success('Discount removed');
      fetchDiscounts();
    } catch (err: any) { toastError('Failed', err.message); }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Discounts</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
            Manage promotional offers and loyalty rules.
          </p>
        </div>
        <Link href="/discounts/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm">
          <Plus size={18} /> New Discount
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-text-secondary">
          <Loader2 size={22} className="animate-spin text-plano-600" />
          <span className="text-sm font-medium">Loading discounts...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <AlertCircle size={32} className="text-danger-400" />
          <p className="text-sm font-bold text-danger-600">{error}</p>
          <button onClick={fetchDiscounts} className="text-xs font-bold text-plano-600 underline">Retry</button>
        </div>
      ) : discounts.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300">
            <FileText size={32} />
          </div>
          <p className="text-lg font-serif font-bold text-text-primary">No discounts yet</p>
          <Link href="/discounts/new"
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn font-bold shadow-sm">
            <Plus size={16} /> Create First Discount
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount: any) => (
            <div key={discount._id}
              className="bg-bg-surface border border-border rounded-card p-6 flex flex-col gap-5 hover:shadow-md hover:-translate-y-1 transition-all group overflow-hidden relative">
              {!discount.isActive && <div className="absolute inset-0 bg-gray-50/50 pointer-events-none z-0" />}

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-plano-50 dark:bg-white/10 text-plano-600 dark:text-plano-400 flex items-center justify-center border border-plano-100 dark:border-white/5">
                    <TicketPercent size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-sans font-bold text-text-primary uppercase tracking-tight group-hover:text-plano-600 transition-colors">
                      {discount.code}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest">{discount.name}</span>
                  </div>
                </div>
                <div className={cn('w-1.5 h-1.5 rounded-full mt-2', discount.isActive ? 'bg-success-500' : 'bg-gray-300')} />
              </div>

              <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-serif font-bold text-text-primary">
                    {discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value, 'INR')}
                  </span>
                  <span className="text-xs font-bold text-gray-400 pb-2 uppercase tracking-widest">OFF</span>
                </div>
                {discount.appliesTo && (
                  <span className="text-[10px] font-bold text-plano-600 dark:text-plano-400 uppercase tracking-widest bg-plano-50 dark:bg-white/10 border border-plano-100 dark:border-white/5 px-2.5 py-1 rounded-full self-start">
                    On: {discount.appliesTo}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-border dark:border-sidebar-hover relative z-10">
                {discount.usageLimit > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Usage</span>
                      <span className="text-[10px] font-bold text-text-primary">
                        {discount.usageCount ?? 0} / {discount.usageLimit} uses
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', discount.isActive ? 'bg-plano-600' : 'bg-gray-300')}
                        style={{ width: `${Math.min(((discount.usageCount ?? 0) / discount.usageLimit) * 100, 100)}%` }} />
                    </div>
                  </>
                )}
                {(discount.validFrom || discount.validTo) && (
                  <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                    <Calendar size={12} className="text-gray-400" />
                    {discount.validFrom ? new Date(discount.validFrom).toLocaleDateString() : '∞'}
                    {' → '}
                    {discount.validTo ? new Date(discount.validTo).toLocaleDateString() : '∞'}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 relative z-10">
                <button onClick={() => handleToggle(discount._id)}
                  className={cn('p-2 rounded-btn transition-colors',
                    discount.isActive ? 'text-gray-400 hover:text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20'
                      : 'text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20')}>
                  <Power size={16} />
                </button>
                <Link href={`/discounts/${discount._id}/edit`}
                  className="p-2 rounded-btn text-gray-400 hover:text-plano-600 hover:bg-plano-50 dark:hover:bg-white/10 transition-colors">
                  <Edit2 size={16} />
                </Link>
                <button onClick={() => handleDelete(discount._id)}
                  className="p-2 rounded-btn text-gray-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <Link href="/discounts/new"
            className="bg-bg-page border-2 border-dashed border-border dark:border-sidebar-hover rounded-card p-6 flex flex-col items-center justify-center gap-4 hover:bg-bg-surface hover:border-plano-400 transition-all group min-h-[280px]">
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-plano-50 flex items-center justify-center text-gray-400 group-hover:text-plano-600 transition-all">
              <Plus size={24} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-text-secondary group-hover:text-plano-600 transition-all">Add Discount</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center mt-1">Configure coupons & rules</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
