'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Banknote,
  Smartphone,
  SmartphoneIcon
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const mockPayments = [
  { id: 'PAY-00041', invId: 'INV-00089', customer: 'Acme Corp', method: 'Bank Transfer', date: 'Apr 16, 2025', amount: 12450, status: 'PAID' },
  { id: 'PAY-00040', invId: 'INV-00088', customer: 'TechSolve Ltd', method: 'UPI', date: 'Apr 12, 2025', amount: 5000, status: 'PARTIAL' },
  { id: 'PAY-00039', invId: 'INV-00086', customer: 'Global Labs', method: 'Card', date: 'Apr 10, 2025', amount: 12450, status: 'PAID' },
  { id: 'PAY-00038', invId: 'INV-00084', customer: 'StartupX', method: 'Cash', date: 'Apr 02, 2025', amount: 24999, status: 'PAID' },
  { id: 'PAY-00037', invId: 'INV-00082', customer: 'Infinity Soft', method: 'Bank Transfer', date: 'Mar 28, 2025', amount: 4500, status: 'PENDING' },
];

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Payments</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
             Reconcile and manage incoming transactions.
          </p>
        </div>
        <button 
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          Record New Payment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-bg-surface p-4 rounded-card border border-border shadow-sm">
        <div className="relative flex-1 max-w-sm">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search by payment # or txn id..."
             className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:outline-none transition-all text-sm font-sans"
           />
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 h-10 border border-border bg-white rounded-input text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-50 transition-colors">
              <Filter size={14} />
              Filters
           </button>
           <button className="flex items-center gap-2 px-4 h-10 border border-border bg-white rounded-input text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-50 transition-colors">
              <Download size={14} />
              Export
           </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Payment #</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Invoice #</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Customer</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Method</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Date</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-right">Amount</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-center">Status</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {mockPayments.map((pay) => (
                     <tr key={pay.id} className="group hover:bg-gray-25 transition-colors">
                        <td className="py-4 px-6">
                           <span className="text-xs font-mono font-bold text-text-primary tracking-tighter">{pay.id}</span>
                        </td>
                        <td className="py-4 px-6">
                           <Link href={`/invoices/${pay.invId}`} className="text-xs font-mono font-bold text-plano-600 hover:underline">
                              {pay.invId}
                           </Link>
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-text-primary">
                           {pay.customer}
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-2">
                              <span className={cn(
                                 "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                                 pay.method === 'Bank Transfer' ? "bg-plano-50 text-plano-700 border-plano-200" :
                                 pay.method === 'UPI' ? "bg-info-50 text-info-700 border-info-200" :
                                 pay.method === 'Card' ? "bg-gray-100 text-gray-700 border-gray-200" :
                                 "bg-amber-50 text-amber-700 border-amber-200"
                              )}>
                                 {pay.method}
                              </span>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                           {pay.date}
                        </td>
                        <td className="py-4 px-6 text-right">
                           <span className="text-sm font-bold font-mono text-text-primary">{formatCurrency(pay.amount, 'INR')}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                           <span className={cn(
                              "text-[10px] font-bold uppercase tracking-tighter px-2.5 py-1 rounded-full",
                              pay.status === 'PAID' ? "bg-success-50 text-success-700 border border-success-200" : 
                              pay.status === 'PARTIAL' ? "bg-warning-50 text-warning-700 border border-warning-200" :
                              "bg-gray-100 text-gray-500 border border-gray-200"
                           )}>
                              {pay.status}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button className="p-1.5 rounded-btn hover:bg-plano-50 text-gray-400 hover:text-plano-600 transition-all">
                                 <ArrowUpRight size={18} />
                              </button>
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
      </div>
    </div>
  );
}
