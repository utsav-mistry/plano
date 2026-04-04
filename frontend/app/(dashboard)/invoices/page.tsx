'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchInvoices() {
      setIsLoading(true);
      setError(null);
      try {
        const params = activeTab !== 'ALL' ? { status: activeTab.toLowerCase() } : {};
        const response = await api.invoices.getAll(params);
        if (response.success) {
          const data = response.data as any;
          setInvoices(data.invoices ?? data ?? []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoices();
  }, [activeTab]);

  const filteredInvoices = invoices.filter((inv: any) => 
    inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    (typeof inv.userId === 'object' && inv.userId?.name?.toLowerCase().includes(search.toLowerCase()))
  );

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
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
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
      <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm min-h-[400px] flex flex-col">
         {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
               <Loader2 className="w-8 h-8 text-plano-600 animate-spin" />
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading invoices...</p>
            </div>
         ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
               <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center text-danger-500 text-sm">
                 <AlertCircle size={24} />
               </div>
               <p className="text-sm font-bold text-text-primary uppercase tracking-tight">{error}</p>
               <button 
                 onClick={() => window.location.reload()}
                 className="text-xs font-bold text-plano-600 underline uppercase tracking-widest"
               >
                 Try again
               </button>
            </div>
         ) : filteredInvoices.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
               <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                 <FileText size={32} />
               </div>
               <p className="text-lg font-serif font-bold text-text-primary">No invoices found</p>
            </div>
         ) : (
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
                     {filteredInvoices.map((inv: any) => (
                        <tr key={inv._id || inv.id} className="group hover:bg-gray-25 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex flex-col">
                                 <span className="text-xs font-mono font-bold text-text-primary tracking-tighter">{inv.invoiceNumber}</span>
                                 <Link 
                                   href={`/subscriptions/${typeof inv.subscriptionId === 'object' ? inv.subscriptionId?._id : inv.subscriptionId}`} 
                                   className="text-[10px] text-plano-600 font-bold hover:underline"
                                 >
                                    {typeof inv.subscriptionId === 'object' ? 'View Sub' : 'View Sub'}
                                 </Link>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-plano-100 text-plano-700 flex items-center justify-center text-[10px] font-bold border border-plano-200">
                                    {typeof inv.userId === 'object' ? inv.userId?.name?.charAt(0) : 'U'}
                                 </div>
                                 <span className="text-sm font-semibold text-text-primary">
                                   {typeof inv.userId === 'object' ? inv.userId?.name : 'Customer'}
                                 </span>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-xs text-gray-500 font-medium whitespace-nowrap">
                              {new Date(inv.issueDate).toLocaleDateString()}
                           </td>
                           <td className="py-4 px-6 text-xs font-bold text-gray-500 whitespace-nowrap">
                              <span className={inv.status === 'overdue' ? "text-danger-600" : ""}>
                                {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                              </span>
                           </td>
                           <td className="py-4 px-6 text-right">
                              <span className="text-sm font-bold font-mono text-text-primary">{formatCurrency(inv.totalAmount || 0, inv.currency || 'INR')}</span>
                           </td>
                           <td className="py-4 px-6 text-center">
                              <span className={cn(
                                 "text-[10px] font-bold uppercase tracking-tighter px-2.5 py-1 rounded-full",
                                 inv.status === 'paid' ? "bg-success-50 text-success-700 border border-success-200" : 
                                 inv.status === 'overdue' ? "bg-danger-50 text-danger-700 border border-danger-200" :
                                 inv.status === 'confirmed' ? "bg-info-50 text-info-700 border border-info-200" :
                                 "bg-gray-100 text-gray-500 border border-gray-200"
                              )}>
                                 {inv.status}
                              </span>
                           </td>
                           <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <Link 
                                   href={`/invoices/${inv._id || inv.id}`}
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
         )}
      </div>
    </div>
  );
}
