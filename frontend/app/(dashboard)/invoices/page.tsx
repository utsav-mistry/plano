'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Printer, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Invoice } from '@/types';

const mockInvoices = [
  { id: 'INV-00089', subId: 'SUB-00142', customer: 'Acme Corp', avatar: 'AC', issueDate: 'Apr 15, 2025', dueDate: 'May 15, 2025', amount: 12450, status: 'PAID' },
  { id: 'INV-00088', subId: 'SUB-00141', customer: 'TechSolve Ltd', avatar: 'TS', issueDate: 'Apr 10, 2025', dueDate: 'May 10, 2025', amount: 25000, status: 'OVERDUE' },
  { id: 'INV-00087', subId: 'SUB-00140', customer: 'StartupX', avatar: 'SX', issueDate: 'Apr 05, 2025', dueDate: 'May 05, 2025', amount: 9999, status: 'CONFIRMED' },
  { id: 'INV-00086', subId: 'SUB-00139', customer: 'Global Labs', avatar: 'GL', issueDate: 'Mar 25, 2025', dueDate: 'Apr 25, 2025', amount: 12450, status: 'PAID' },
  { id: 'INV-00085', subId: 'SUB-00138', customer: 'Infinity Soft', avatar: 'IS', issueDate: 'Mar 15, 2025', dueDate: 'Apr 15, 2025', amount: 4500, status: 'DRAFT' },
];

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Overdue', value: 'OVERDUE' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Invoices</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
             Track payments and revenue collection states.
          </p>
        </div>
        <Link 
          href="/invoices/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          Create Manual Invoice
        </Link>
      </div>

      {/* Tabs / Filters Bar */}
      <div className="bg-bg-surface p-5 rounded-card border border-border shadow-sm flex flex-col gap-5">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search by invoice # or customer..."
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

         <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
                  activeTab === tab.value 
                    ? "bg-plano-900 text-white shadow-md" 
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Invoice #</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Customer</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Issue Date</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Due Date</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-right">Amount</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-center">Status</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {mockInvoices.map((inv) => (
                     <tr key={inv.id} className="group hover:bg-gray-25 transition-colors">
                        <td className="py-4 px-6">
                           <div className="flex flex-col">
                              <span className="text-xs font-mono font-bold text-text-primary tracking-tighter">{inv.id}</span>
                              <Link href={`/subscriptions/${inv.subId}`} className="text-[10px] text-plano-600 font-bold hover:underline">
                                 {inv.subId}
                              </Link>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-plano-100 text-plano-700 flex items-center justify-center text-[10px] font-bold border border-plano-200">
                                 {inv.avatar}
                              </div>
                              <span className="text-sm font-semibold text-text-primary">{inv.customer}</span>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                           {inv.issueDate}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-gray-500">
                           <span className={inv.status === 'OVERDUE' ? "text-danger-600" : ""}>{inv.dueDate}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <span className="text-sm font-bold font-mono text-text-primary">{formatCurrency(inv.amount, 'INR')}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                           <span className={cn(
                              "text-[10px] font-bold uppercase tracking-tighter px-2.5 py-1 rounded-full",
                              inv.status === 'PAID' ? "bg-success-50 text-success-700 border border-success-200" : 
                              inv.status === 'OVERDUE' ? "bg-danger-50 text-danger-700 border border-danger-200" :
                              inv.status === 'CONFIRMED' ? "bg-info-50 text-info-700 border border-info-200" :
                              "bg-gray-100 text-gray-500 border border-gray-200"
                           )}>
                              {inv.status}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/invoices/${inv.id}`}
                                className="p-1.5 rounded-btn hover:bg-plano-50 text-gray-400 hover:text-plano-600 transition-all opacity-0 group-hover:opacity-100"
                              >
                                 <Eye size={18} />
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
      </div>
    </div>
  );
}
