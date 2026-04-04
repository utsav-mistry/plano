'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ArrowUpRight,
  Banknote,
  Smartphone,
  Loader2,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { error: toastError } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.payments.getAll();
      if (response.success) {
        const data = response.data as any;
        setPayments(data.payments ?? data ?? []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPayments = payments.filter(p => 
    p.transactionId?.toLowerCase().includes(search.toLowerCase()) || 
    p._id.toLowerCase().includes(search.toLowerCase()) ||
    (typeof p.userId === 'object' && p.userId?.name?.toLowerCase().includes(search.toLowerCase()))
  );

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
        <Link 
          href="/payments/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          Record Payment
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-bg-surface p-4 rounded-card border border-border shadow-sm">
        <div className="relative flex-1 max-w-sm">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search by transaction ID or user..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
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
      <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm min-h-[400px] flex flex-col">
         {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
               <Loader2 className="w-8 h-8 text-plano-600 animate-spin" />
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reconciling Ledger...</p>
            </div>
         ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
               <AlertCircle size={32} className="text-danger-500" />
               <p className="text-sm font-bold text-text-primary uppercase">{error}</p>
               <button onClick={fetchPayments} className="text-xs font-bold text-plano-600 underline">Reload payments</button>
            </div>
         ) : filteredPayments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                <Banknote size={32} />
              </div>
              <p className="text-lg font-serif font-bold text-text-primary">No payments found</p>
              <Link href="/payments/new" className="text-xs font-bold text-plano-600 uppercase tracking-widest hover:underline">
                Record manual entry
              </Link>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-border bg-gray-50/50">
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Payment ID</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Source</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Customer</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Method</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-right">Amount</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-center">Status</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {filteredPayments.map((pay) => (
                        <tr key={pay._id} className="group hover:bg-gray-25 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="text-xs font-mono font-bold text-text-primary tracking-tighter">PAY-{pay._id.slice(-6).toUpperCase()}</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(pay.paymentDate).toLocaleDateString()}</span>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              {pay.invoiceId ? (
                                <Link href={`/invoices/${typeof pay.invoiceId === 'object' ? pay.invoiceId?._id : pay.invoiceId}`} className="flex items-center gap-1 text-xs font-mono font-bold text-plano-600 hover:underline">
                                   <Receipt size={12} />
                                   INV-{typeof pay.invoiceId === 'object' ? pay.invoiceId?.invoiceNumber : '...'}
                                </Link>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Standalone</span>
                              )}
                           </td>
                           <td className="py-4 px-6 text-sm font-semibold text-text-primary">
                              {typeof pay.userId === 'object' ? pay.userId?.name : 'Customer'}
                           </td>
                           <td className="py-4 px-6">
                              <span className={cn(
                                 "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
                                 pay.paymentMethod === 'bank_transfer' ? "bg-plano-50 text-plano-700 border-plano-200" :
                                 pay.paymentMethod === 'card' ? "bg-info-50 text-info-700 border-info-200" :
                                 "bg-gray-100 text-gray-700 border-gray-200"
                              )}>
                                 {pay.paymentMethod.replace('_', ' ')}
                              </span>
                           </td>
                           <td className="py-4 px-6 text-right">
                              <span className="text-sm font-bold font-mono text-text-primary">{formatCurrency(pay.amount, pay.currency || 'INR')}</span>
                           </td>
                           <td className="py-4 px-6 text-center">
                              <span className={cn(
                                 "text-[10px] font-bold uppercase tracking-tighter px-2.5 py-1 rounded-full",
                                 pay.status === 'completed' ? "bg-success-50 text-success-700 border border-success-200" : 
                                 pay.status === 'failed' ? "bg-danger-50 text-danger-700 border border-danger-200" :
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
         )}
      </div>
    </div>
  );
}
