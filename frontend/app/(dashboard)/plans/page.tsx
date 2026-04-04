'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CalendarClock, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Edit2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Plan } from '@/types';

const mockPlans: Partial<Plan>[] = [
  { id: '1', name: 'Monthly Pro', price: 2999, currency: 'INR', billingCycle: 'monthly', isActive: true, createdAt: '2025-01-15', trialDays: 14 },
  { id: '2', name: 'Annual Enterprise', price: 25000, currency: 'INR', billingCycle: 'yearly', isActive: true, createdAt: '2025-02-10', trialDays: 30 },
  { id: '3', name: 'Weekly Starter', price: 999, currency: 'INR', billingCycle: 'weekly', isActive: false, createdAt: '2025-03-01', trialDays: 7 },
  { id: '4', name: 'Monthly Elite', price: 9999, currency: 'INR', billingCycle: 'monthly', isActive: true, createdAt: '2025-03-20', trialDays: 14 },
];

export default function PlansPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Recurring Plans</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
             Design and offer various subscription structures.
          </p>
        </div>
        <Link 
          href="/plans/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          Create Plan
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-bg-surface p-4 rounded-card border border-border shadow-sm">
        <div className="relative flex-1 max-w-sm">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search plans..."
             className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:outline-none transition-all text-sm font-sans"
           />
        </div>
        <button className="flex items-center gap-2 px-4 h-10 border border-border bg-white rounded-input text-xs font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-50 transition-colors">
           <Filter size={14} />
           Refine list
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {mockPlans.map((plan) => (
            <div key={plan.id} className="bg-bg-surface border border-border rounded-card p-6 flex flex-col gap-6 hover:shadow-md hover:-translate-y-1 transition-all group">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-plano-50 text-plano-600 flex items-center justify-center">
                        <CalendarClock size={20} />
                     </div>
                     <div className="flex flex-col">
                        <h3 className="text-lg font-sans font-bold text-text-primary leading-tight group-hover:text-plano-600 transition-colors">{plan.name}</h3>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{plan.billingCycle} execution</span>
                     </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                     <MoreVertical size={18} />
                  </button>
               </div>

               <div className="flex flex-col gap-0.5">
                  <span className="text-3xl font-serif font-bold text-text-primary">{formatCurrency(plan.price || 0, plan.currency)}</span>
                  <span className="text-xs font-semibold text-gray-400">per unit / {plan.billingCycle}</span>
               </div>

               <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                  <div className="flex flex-col gap-1">
                     <span className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.2em]">Trial Period</span>
                     <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                        <Clock size={12} className="text-plano-500" />
                        {plan.trialDays} days free
                     </div>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.2em]">Status</span>
                     <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                        {plan.isActive ? (
                           <CheckCircle2 size={12} className="text-success-500" />
                        ) : (
                           <AlertCircle size={12} className="text-danger-500" />
                        )}
                        {plan.isActive ? 'Active Plan' : 'Inactive'}
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.2em]">Usage Progress</span>
                     <span className="text-[10px] font-bold text-text-secondary">42 active subs</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-plano-600 rounded-full" style={{ width: '65%' }}></div>
                  </div>
               </div>

               <div className="mt-4 flex items-center justify-between">
                  <button className="text-[11px] uppercase font-bold text-text-secondary hover:text-plano-600 transition-all flex items-center gap-1 tracking-widest">
                     <Edit2 size={14} />
                     Modify
                  </button>
                  <div className="flex items-center gap-2">
                     <button className="p-2 rounded-btn border border-border bg-white text-gray-400 hover:text-plano-600 transition-all">
                        <Copy size={16} />
                     </button>
                     <button className="p-2 rounded-btn border border-border bg-white text-gray-400 hover:text-danger-600 transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
