'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  MoreVertical, 
  Calendar, 
  Download,
  AlertCircle,
  FileCheck,
  Pause,
  Play
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Subscription } from '@/types';

const mockSubscriptions: Partial<Subscription>[] = [
  { id: 'SUB-00142', userId: { name: 'Acme Corp', avatar: 'AC' }, planId: { name: 'Monthly Pro' }, status: 'active', startDate: '2025-01-15', endDate: '2026-01-15', grandTotal: 12450, currency: 'INR' },
  { id: 'SUB-00141', userId: { name: 'TechSolve Ltd', avatar: 'TS' }, planId: { name: 'Annual Starter' }, status: 'paused', startDate: '2025-02-10', endDate: '2026-02-10', grandTotal: 25000, currency: 'INR' },
  { id: 'SUB-00140', userId: { name: 'StartupX', avatar: 'SX' }, planId: { name: 'Monthly Elite' }, status: 'active', startDate: '2025-03-01', endDate: '2026-03-01', grandTotal: 9999, currency: 'INR' },
  { id: 'SUB-00139', userId: { name: 'Global Labs', avatar: 'GL' }, planId: { name: 'Monthly Pro' }, status: 'quotation', startDate: '2025-03-15', endDate: '2026-03-15', grandTotal: 12450, currency: 'INR' },
  { id: 'SUB-00138', userId: { name: 'Infinity Soft', avatar: 'IS' }, planId: { name: 'Monthly Starter' }, status: 'expired', startDate: '2024-03-01', endDate: '2025-03-01', grandTotal: 4500, currency: 'INR' },
  { id: 'SUB-00137', userId: { name: 'CloudPeak', avatar: 'CP' }, planId: { name: 'Annual Pro' }, status: 'active', startDate: '2025-03-25', endDate: '2026-03-25', grandTotal: 145000, currency: 'INR' },
];

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = [
    { label: 'All', count: 312, value: 'ALL' },
    { label: 'Draft', count: 28, value: 'DRAFT' },
    { label: 'Quotation', count: 14, value: 'QUOTATION' },
    { label: 'Active', count: 248, value: 'ACTIVE' },
    { label: 'Expired', count: 22, value: 'EXPIRED' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Subscriptions</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
             Manage and track customer subscription lifecycles.
          </p>
        </div>
        <Link 
          href="/subscriptions/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          New Subscription
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[
           { label: 'Active Subs', count: 248, trend: '+14%', color: 'text-success-600', bg: 'bg-success-50' },
           { label: 'Expiring this month', count: 12, trend: '-2%', color: 'text-warning-600', bg: 'bg-warning-50' },
           { label: 'Overdue Revenue', count: '₹2.4L', trend: '+18%', color: 'text-danger-600', bg: 'bg-danger-50' },
         ].map((stat, i) => (
            <div key={i} className="bg-bg-surface p-4 rounded-card border border-border shadow-sm flex items-center justify-between">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{stat.label}</span>
                  <span className="text-2xl font-serif font-bold text-text-primary">{stat.count}</span>
               </div>
               <div className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", stat.bg, stat.color)}>
                  {stat.trend}
               </div>
            </div>
         ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 bg-bg-surface p-5 rounded-card border border-border shadow-sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search by customer name, sub #, or invoice..."
                 className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:outline-none transition-all text-sm font-sans"
               />
            </div>
            
            <div className="flex items-center gap-2">
               <button className="flex items-center gap-2 px-4 h-10 border border-border bg-white rounded-input text-xs font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-50 transition-colors">
                  <Filter size={14} />
                  Filters
               </button>
               <button className="flex items-center gap-2 px-4 h-10 border border-border bg-white rounded-input text-xs font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-50 transition-colors">
                  <Download size={14} />
                  Export
               </button>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                  activeTab === tab.value 
                    ? "bg-plano-600 text-white shadow-md shadow-plano-600/20" 
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {tab.label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none",
                  activeTab === tab.value ? "bg-white/20" : "bg-gray-200"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
         </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Sub Number</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Customer</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Status</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Plan Name</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Grand Total</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {mockSubscriptions.map((sub) => (
                     <tr key={sub.id} className="group hover:bg-gray-25 transition-colors">
                        <td className="py-4 px-6">
                           <div className="flex flex-col">
                              <span className="text-xs font-mono font-bold text-text-primary tracking-tighter">{sub.id}</span>
                              <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                                 <Calendar size={10} />
                                 {sub.startDate}
                              </span>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-plano-100 text-plano-700 flex items-center justify-center text-[10px] font-bold border border-plano-200 uppercase">
                                 {sub.userId?.avatar}
                              </div>
                              <span className="text-sm font-semibold text-text-primary">{sub.userId?.name}</span>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                           <span className={cn(
                              "text-[10px] font-bold uppercase tracking-tighter px-2.5 py-1 rounded-full",
                              sub.status === 'active' ? "bg-success-50 text-success-700 border border-success-200" : 
                              sub.status === 'paused' ? "bg-warning-50 text-warning-700 border border-warning-200" :
                              sub.status === 'expired' ? "bg-danger-50 text-danger-700 border border-danger-200" :
                              "bg-gray-100 text-gray-500 border border-gray-200"
                           )}>
                              {sub.status}
                           </span>
                        </td>
                        <td className="py-4 px-6">
                           <span className="text-xs font-bold text-text-secondary flex items-center gap-2">
                              <FileCheck size={14} className="text-plano-600" />
                              {sub.planId?.name}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-text-primary">{formatCurrency(sub.grandTotal || 0, sub.currency)}</span>
                              <span className="text-[9px] uppercase font-bold text-gray-400">incl. tax</span>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/subscriptions/${sub.id}`}
                                className="p-1.5 rounded-btn hover:bg-plano-50 text-gray-400 hover:text-plano-600 transition-all opacity-0 group-hover:opacity-100"
                              >
                                 <ArrowUpRight size={18} />
                              </Link>
                              <button className="p-1.5 rounded-btn hover:bg-gray-100 text-gray-400 hover:text-text-primary transition-all">
                                 <MoreVertical size={18} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <div className="px-6 py-4 bg-gray-50/50 border-t border-border flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Showing 6 of 312 subscriptions</span>
            <div className="flex items-center gap-1">
               <button className="px-3 py-1 rounded border border-border bg-white text-[10px] font-bold text-gray-400" disabled>Previous</button>
               <button className="px-3 py-1 rounded border border-plano-600 bg-plano-600 text-[10px] font-bold text-white">1</button>
               <button className="px-3 py-1 rounded border border-border bg-white text-[10px] font-bold text-gray-600">2</button>
               <button className="px-3 py-1 rounded border border-border bg-white text-[10px] font-bold text-gray-600">Next</button>
            </div>
         </div>
      </div>
    </div>
  );
}
