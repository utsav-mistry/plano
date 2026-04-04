'use client';

import React, { useState } from 'react';
import {
  Plus,
  ArrowLeft,
  Save,
  Info,
  Ticket,
  IndianRupee,
  Check,
  Loader2,
  ChevronDown,
  Calendar,
  Zap,
  Percent,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage (%)', icon: <Percent size={18} /> },
  { value: 'fixed', label: 'Fixed Amount', icon: <IndianRupee size={18} /> },
];

const DISCOUNT_ENTITY_TARGETS = [
  { value: 'subscriptions', label: 'All Subscriptions', sub: 'Apply to recurring billing logs' },
  { value: 'plans', label: 'Specific Plans', sub: 'Target individual product tiers' },
  { value: 'invoices', label: 'Manual Invoices', sub: 'Apply at checkout point' },
];

export default function NewDiscountPage() {
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    appliesTo: 'subscriptions',
    usageLimit: '',
    validFrom: '',
    validTo: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) {
      toastError('Validation', 'Missing required coupon fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.discounts.create({
        ...form,
        code: form.code.toUpperCase().trim(),
        value: Number(form.value),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
        validTo: form.validTo ? new Date(form.validTo).toISOString() : undefined,
      });
      if (res.success) {
        success('Coupon published!', 'The discount code is now active for users.');
        window.location.href = '/admin/discounts';
      }
    } catch (err: any) {
      toastError('Setup interrupted', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "text-[11px] uppercase font-bold text-gray-500 tracking-widest mb-1.5 flex items-center gap-1.5";
  const inputStyle = "w-full h-11 px-4 rounded-lg border border-border dark:border-sidebar-hover bg-white dark:bg-bg-page text-text-primary focus:border-plano-500 dark:focus:bg-white/10 focus:outline-none transition-all text-sm font-sans shadow-sm";

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/discounts" className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-plano-600 transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Campaigns
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl text-text-primary">Create Discount Strategy</h1>
            <p className="text-sm text-text-secondary font-medium uppercase tracking-[0.2em] text-[10px]">
              Campaigns / Discounts / New
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <Ticket size={80} className="text-gray-50 opacity-20 -rotate-12" />
            </div>

            <div className="flex items-center gap-3 pb-5 border-b border-border dark:border-sidebar-hover relative">
              <div className="w-10 h-10 rounded-xl bg-plano-50 dark:bg-white/10 text-plano-600 dark:text-plano-400 flex items-center justify-center border border-plano-100 dark:border-sidebar-hover shadow-sm">
                <Ticket size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">Coupon Identity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div className="flex flex-col">
                <label className={labelStyle}>Coupon Code *</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-plano-400 font-bold border-r border-border dark:border-sidebar-hover pr-3 mr-3 uppercase text-xs">
                     CODE
                   </div>
                   <input 
                     suppressHydrationWarning
                     required
                     type="text" 
                     placeholder="e.g. SUMMER25"
                     value={form.code}
                     onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
                     className={cn(inputStyle, "pl-16 font-mono font-bold tracking-widest")}
                   />
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>Campaign Name *</label>
                <input
                  suppressHydrationWarning
                  required
                  type="text"
                  placeholder="e.g. 2025 Summer Sprint"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <label className={labelStyle}>Discount Type & Value *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DISCOUNT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: type.value as 'percentage' | 'fixed' })}
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 relative",
                        form.type === type.value 
                          ? "bg-plano-50 dark:bg-white/10 border-plano-500 text-plano-700 dark:text-plano-300 shadow-lg ring-4 ring-plano-100 dark:ring-white/5" 
                          : "bg-white dark:bg-bg-page border-border dark:border-sidebar-hover text-text-secondary hover:border-plano-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                         form.type === type.value ? "bg-plano-600 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400"
                      )}>
                        {type.icon}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold uppercase tracking-widest">{type.label}</span>
                        <span className="text-[10px] opacity-60 font-medium">Billed as per {type.value}</span>
                      </div>
                      {form.type === type.value && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-plano-600 rounded-full flex items-center justify-center text-white">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <label className={labelStyle}>Discount Amount Value *</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-border dark:border-sidebar-hover pr-3 mr-3">
                     {form.type === 'percentage' ? '%' : '₹'}
                   </div>
                   <input 
                     suppressHydrationWarning
                     required
                     type="number" 
                     placeholder={form.type === 'percentage' ? '25' : '500'}
                     value={form.value}
                     onChange={(e) => setForm({...form, value: e.target.value})}
                     className={cn(inputStyle, "pl-16 font-mono font-bold text-lg")}
                   />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-bg-surface p-8 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-8">
            <div className="flex items-center gap-3 pb-5 border-b border-border dark:border-sidebar-hover relative">
              <div className="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/10 text-success-600 flex items-center justify-center border border-success-100 dark:border-sidebar-hover shadow-sm">
                <Clock size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">Constraints & Validity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div className="flex flex-col">
                <label className={labelStyle}>Valid From</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className={cn(inputStyle, "pl-11 pr-4")}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>Expires After (Optional)</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={form.validTo}
                    onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                    className={cn(inputStyle, "pl-11 pr-4")}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelStyle}>Total Usage Limit (0 = Unlimited)</label>
              <div className="relative">
                <Zap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  suppressHydrationWarning
                  type="number"
                  placeholder="e.g. 500 redemptions"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  className={cn(inputStyle, "pl-11")}
                />
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex items-center gap-4">
             <button 
               type="submit"
               disabled={isSubmitting}
               className="flex-1 h-14 rounded-xl bg-plano-600/90 hover:bg-plano-700 text-white text-lg font-bold transition-all shadow-xl hover:shadow-2xl disabled:opacity-60 flex items-center justify-center gap-3 decoration-none border-0"
             >
               {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
               {isSubmitting ? 'Publishing...' : 'Publish Discount Campaign'}
             </button>
             <Link 
               href="/discounts"
               className="px-10 h-14 rounded-xl border-2 border-border dark:border-sidebar-hover bg-bg-surface text-lg font-bold text-text-secondary hover:bg-sidebar-hover transition-all flex items-center justify-center"
             >
               Discard
             </Link>
          </div>
        </div>

        {/* Right Sidebar: Target Selection & Summary */}
        <div className="flex flex-col gap-6">
           <section className="bg-bg-surface p-8 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-2 pb-4 border-b border-border dark:border-sidebar-hover">
                 <LayoutDashboard size={18} className="text-plano-600" />
                 <label className={labelStyle}>Applies To</label>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                 {DISCOUNT_ENTITY_TARGETS.map((target) => (
                    <button 
                      key={target.value}
                      type="button"
                      onClick={() => setForm({...form, appliesTo: target.value})}
                      className={cn(
                        "flex flex-col p-4 rounded-xl border-2 transition-all text-left group",
                        form.appliesTo === target.value 
                          ? "bg-plano-600 dark:bg-plano-500 border-plano-600 dark:border-plano-400 text-white shadow-lg shadow-plano-600/20" 
                          : "bg-bg-page border-border dark:border-sidebar-hover text-text-secondary hover:border-plano-300 dark:hover:border-plano-600"
                      )}
                    >
                       <span className="text-xs font-bold uppercase tracking-widest">{target.label}</span>
                       <span className={cn(
                         "text-[10px] mt-1 font-medium",
                         form.appliesTo === target.value ? "text-plano-300" : "text-gray-400"
                       )}>{target.sub}</span>
                    </button>
                 ))}
              </div>
           </section>

           {/* Campaign Summary Card */}
           <div className="bg-plano-50 dark:bg-white/5 rounded-card p-8 flex flex-col gap-6 border-2 border-dashed border-plano-200 dark:border-sidebar-hover">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-bold text-plano-600 dark:text-plano-400 uppercase tracking-widest border border-plano-200 dark:border-sidebar-hover rounded-full px-3 py-1 w-fit bg-white dark:bg-white/10">Campaign Preview</span>
              </div>
              
              <div className="flex flex-col gap-4">
                 <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Active Coupon</span>
                    <h4 className="text-3xl font-serif font-bold text-plano-900 dark:text-white tracking-tighter">
                       {form.code || '...'}
                    </h4>
                 </div>

                 <div className="flex flex-col">
                   <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Reduction Value</span>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-mono font-bold text-success-600 dark:text-success-400">
                        {form.type === 'percentage' ? `${form.value || '0'}%` : formatCurrency(Number(form.value) || 0, 'INR')}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">OFF Total</span>
                   </div>
                 </div>

                 <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-plano-100 dark:border-sidebar-hover italic">
                    <p className="text-xs text-plano-700 dark:text-plano-300 leading-relaxed">
                       {form.name ? `"${form.name}"` : 'Campaign title...'} will apply to {form.appliesTo.replace('_', ' ')} based on the configured logic.
                    </p>
                 </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-white/10 border border-plano-100 dark:border-sidebar-hover flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-success-700 dark:text-success-400 uppercase tracking-widest">Valid across catalog</span>
              </div>
            </div>
        </div>
      </form>
    </div>
  );
}
