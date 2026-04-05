'use client';

import React, { useEffect, useState } from 'react';
import {
   Package, Calendar, CreditCard, ChevronRight, Search,
   Filter, Loader2, Sparkles, LayoutGrid, IndianRupee,
   CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw,
   Download, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Subscription } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/Toast';

function getCycleProgress(startDate?: string, endDate?: string) {
   if (!startDate || !endDate) return 0;
   const start = new Date(startDate).getTime();
   const end = new Date(endDate).getTime();
   const now = Date.now();
   if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
   return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
}

function getCycleLabel(subscription: Subscription) {
   const plan = typeof subscription.planId === 'object' ? subscription.planId : null;
   return plan?.billingCycle || 'recurring';
}

export default function MyOrdersPage() {
   const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [search, setSearch] = useState('');
   const { success: toastSuccess, error: toastError } = useToast();

   const handleDownloadInvoice = async (subscriptionId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
         const invoicesRes = await api.invoices.getAll({ subscriptionId, limit: 1 });
         const invoicesData = invoicesRes.data as { invoices?: { id: string }[] } | { id: string }[];
         const invoices = Array.isArray(invoicesData) ? invoicesData : (invoicesData?.invoices ?? []);
         const latestInvoice = invoices[0];

         if (!latestInvoice?.id) {
            toastError('No invoice found', 'There is no invoice available for this order yet.');
            return;
         }

         const response = await api.invoices.downloadPdf(latestInvoice.id);
         if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${latestInvoice.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toastSuccess('Download Started', 'Your invoice PDF is being generated.');
         } else {
            throw new Error('Failed to download invoice');
         }
      } catch (err) {
         toastError('Download Failed', 'Could not generate the invoice PDF at this time.');
      }
   };

   useEffect(() => {
      async function fetchSubscriptions() {
         try {
            const res = await api.subscriptions.getAll();
            if (res.success) {
               // Handle both direct array and paginated object responses
               const rawData = res.data as { subscriptions?: Subscription[] } | Subscription[];
               const subscriptionList = Array.isArray(rawData) ? rawData : (rawData.subscriptions ?? []);
               setSubscriptions(subscriptionList);
            }
         } catch (err) {
            console.error('Failed to fetch subscriptions', err);
            toastError('Unable to load orders', err instanceof Error ? err.message : 'Please refresh and try again.');
         } finally {
            setIsLoading(false);
         }
      }
      fetchSubscriptions();
   }, [toastError]);

   const filtered = Array.isArray(subscriptions)
      ? subscriptions
         .filter(s =>
            s.id.toLowerCase().includes(search.toLowerCase()) ||
            (typeof s.productId === 'object' && s.productId.name.toLowerCase().includes(search.toLowerCase()))
         )
         .sort((a, b) => (b.grandTotal || 0) - (a.grandTotal || 0))
      : [];

   const recurringSubscriptions = filtered.filter((sub) => sub.autoRenew);
   const oneTimeSubscriptions = filtered.filter((sub) => !sub.autoRenew);

   const getStatusBadge = (status: string) => {
      switch (status.toLowerCase()) {
         case 'active':
            return <span className="px-3 py-1 rounded-full bg-success-50 text-success-600 border border-success-100 flex items-center gap-1.5 w-fit"><CheckCircle2 size={12} strokeWidth={3} /> <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Active</span></span>;
         case 'confirmed':
         case 'paid':
            return <span className="px-3 py-1 rounded-full bg-plano-50 text-plano-600 border border-plano-100 flex items-center gap-1.5 w-fit"><Clock size={12} strokeWidth={3} /> <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Processing</span></span>;
         case 'closed':
         case 'cancelled':
            return <span className="px-3 py-1 rounded-full bg-danger-50 text-danger-500 border border-danger-100 flex items-center gap-1.5 w-fit"><XCircle size={12} strokeWidth={3} /> <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Closed</span></span>;
         default:
            return <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-100 flex items-center gap-1.5 w-fit"><AlertCircle size={12} strokeWidth={3} /> <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{status}</span></span>;
      }
   };

   if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-plano-600" size={32} />
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto px-6 py-12">
         {/* Header Section */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plano-50 border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">
                  <Package size={14} />
                  Subscription History
               </div>
               <h1 className="text-4xl font-bold text-plano-900 uppercase tracking-tighter mb-4 leading-none italic">Manage Orders</h1>
               <p className="text-gray-500 font-medium leading-relaxed">View all your active recurring plans and past transaction history in one centralized portal view. Use IDs to track specific billing issues.</p>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative group flex-1 md:w-64">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                     type="text"
                     placeholder="Find order by ID..."
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="h-12 w-full pl-12 pr-4 rounded-2xl bg-white border border-plano-100 text-sm font-bold text-plano-900 outline-none focus:border-plano-600 focus:shadow-xl focus:shadow-plano-600/5 transition-all text-center uppercase tracking-widest placeholder:text-[10px] placeholder:tracking-[0.1em]"
                  />
               </div>
               <button className="h-12 w-12 rounded-2xl bg-white border border-plano-100 flex items-center justify-center text-gray-400 hover:text-plano-600 hover:border-plano-600 transition-all shadow-sm">
                  <Filter size={18} />
               </button>
            </div>
         </div>

         {/* Orders Table-styled Cards */}
         <div className="space-y-8">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-plano-900 uppercase tracking-tight">Recurring Subscriptions</h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{recurringSubscriptions.length} records</span>
               </div>

               <div className="hidden lg:grid grid-cols-12 gap-4 px-8 mb-4">
                  <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Details</div>
                  <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing Model</div>
                  <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</div>
                  <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</div>
                  <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right tabular-nums">Total Amount</div>
                  <div className="col-span-1" />
               </div>

               <AnimatePresence mode="popLayout">
                  {recurringSubscriptions.length > 0 ? recurringSubscriptions.map((sub, i) => (
                     <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                     >
                        <Link
                           href={`/portal/account/orders/${sub.id}`}
                           className="block bg-white rounded-[2rem] border border-plano-100 p-6 lg:p-4 hover:border-plano-600 hover:shadow-2xl hover:shadow-plano-600/5 hover:-translate-y-1 transition-all group"
                        >
                           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                              {/* Product Info */}
                              <div className="col-span-12 lg:col-span-3 flex items-center gap-4">
                                 <div className="w-14 h-14 rounded-2xl bg-plano-50 flex items-center justify-center text-plano-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Sparkles size={24} strokeWidth={1.5} />
                                 </div>
                                 <div className="grid">
                                    <span className="text-sm font-bold text-plano-900 truncate uppercase tracking-tight">{typeof sub.productId === 'object' ? sub.productId.name : 'Subscription Package'}</span>
                                    <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest">{sub.id}</span>
                                 </div>
                              </div>

                              {/* Pricing */}
                              <div className="col-span-6 lg:col-span-2">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Plan Term</span>
                                    <span className="text-xs font-bold text-plano-600 uppercase tracking-tight">{typeof sub.planId === 'object' ? sub.planId.name : 'Recurring Plan'}</span>
                                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                                       <span className="px-2 py-1 rounded-full bg-plano-50 border border-plano-100 text-[10px] font-bold uppercase tracking-widest text-plano-600">
                                          {getCycleLabel(sub)} cycle
                                       </span>
                                       <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                                          {sub.autoRenew ? 'Auto-renew enabled' : 'Auto-renew off'}
                                       </span>
                                    </div>
                                    <div className="mt-3 w-full max-w-[180px]">
                                       <div className="flex items-center justify-between mb-2">
                                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cycle Progress</span>
                                          <span className="text-[10px] font-bold text-plano-600 tabular-nums">{getCycleProgress(sub.startDate, sub.endDate)}%</span>
                                       </div>
                                       <div className="h-2 rounded-full bg-plano-50 overflow-hidden">
                                          <div
                                             className={cn(
                                                'h-full rounded-full bg-gradient-to-r from-plano-500 to-plano-600 transition-all',
                                                sub.status === 'paused' ? 'from-warning-400 to-warning-500' : sub.status === 'cancelled' ? 'from-gray-300 to-gray-400' : ''
                                             )}
                                             style={{ width: `${getCycleProgress(sub.startDate, sub.endDate)}%` }}
                                          />
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Status */}
                              <div className="col-span-6 lg:col-span-2 flex justify-center">
                                 {getStatusBadge(sub.status)}
                              </div>

                              {/* Period */}
                              <div className="col-span-6 lg:col-span-2">
                                 <div className="flex flex-col gap-1 text-gray-500 font-medium">
                                    <div className="text-[10px] font-bold uppercase tracking-tight">
                                       {format(new Date(sub.startDate), 'MMM dd')} — {format(new Date(sub.endDate), 'MMM dd, yyyy')}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Expires {format(new Date(sub.endDate), 'dd MMM yyyy')}</span>
                                 </div>
                              </div>

                              {/* Amount */}
                              <div className="col-span-6 lg:col-span-2 text-right">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Statement Total</span>
                                    <span className="text-lg font-bold text-plano-900 tabular-nums">₹{sub.grandTotal.toLocaleString()}</span>
                                 </div>
                              </div>

                              {/* Actions */}
                              <div className="col-span-12 lg:col-span-1 flex items-center justify-end gap-3">
                                 <button
                                    onClick={(e) => handleDownloadInvoice(sub.id, e)}
                                    className="w-10 h-10 rounded-xl bg-plano-50 border border-plano-100 flex items-center justify-center text-plano-600 hover:bg-plano-600 hover:text-white transition-all shadow-sm group/btn"
                                    title="Download PDF Invoice"
                                 >
                                    <Download size={18} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                                 </button>
                                 <div className="w-10 h-10 rounded-full border border-plano-50 flex items-center justify-center text-gray-300 group-hover:text-plano-600 group-hover:border-plano-600 group-hover:bg-plano-50 transition-all">
                                    <ChevronRight size={18} />
                                 </div>
                              </div>
                           </div>
                        </Link>
                     </motion.div>
                  )) : (
                     <div className="py-12 text-center rounded-3xl bg-white border border-plano-50">
                        <h3 className="text-sm font-bold text-plano-900 uppercase">No recurring subscriptions</h3>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-2">Auto-renew subscriptions will appear here.</p>
                     </div>
                  )}
               </AnimatePresence>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-plano-900 uppercase tracking-tight">Normal Subscriptions</h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{oneTimeSubscriptions.length} records</span>
               </div>

               <AnimatePresence mode="popLayout">
                  {oneTimeSubscriptions.length > 0 ? oneTimeSubscriptions.map((sub, i) => (
                     <motion.div
                        key={`${sub.id}-normal`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                     >
                        <Link
                           href={`/portal/account/orders/${sub.id}`}
                           className="block bg-white rounded-[2rem] border border-plano-100 p-6 lg:p-4 hover:border-plano-600 hover:shadow-2xl hover:shadow-plano-600/5 hover:-translate-y-1 transition-all group"
                        >
                           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                              <div className="col-span-12 lg:col-span-4 flex items-center gap-4">
                                 <div className="w-14 h-14 rounded-2xl bg-plano-50 flex items-center justify-center text-plano-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Sparkles size={24} strokeWidth={1.5} />
                                 </div>
                                 <div className="grid">
                                    <span className="text-sm font-bold text-plano-900 truncate uppercase tracking-tight">{typeof sub.productId === 'object' ? sub.productId.name : 'Subscription Package'}</span>
                                    <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest">{sub.id}</span>
                                 </div>
                              </div>
                              <div className="col-span-6 lg:col-span-3">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</span>
                                 <div className="mt-2 inline-flex px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-600">One-time</div>
                              </div>
                              <div className="col-span-6 lg:col-span-2 flex justify-center">{getStatusBadge(sub.status)}</div>
                              <div className="col-span-6 lg:col-span-2 text-[10px] font-bold uppercase tracking-tight text-gray-500">
                                 Expires {format(new Date(sub.endDate), 'dd MMM yyyy')}
                              </div>
                              <div className="col-span-6 lg:col-span-1 text-right text-lg font-bold text-plano-900 tabular-nums">₹{sub.grandTotal.toLocaleString()}</div>
                           </div>
                        </Link>
                     </motion.div>
                  )) : (
                     <div className="py-12 text-center rounded-3xl bg-white border border-plano-50">
                        <h3 className="text-sm font-bold text-plano-900 uppercase">No normal subscriptions</h3>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-2">One-time subscriptions will appear here.</p>
                     </div>
                  )}
               </AnimatePresence>
            </div>

            {filtered.length === 0 ? (
               <div className="py-24 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-plano-50 flex items-center justify-center text-gray-300 mx-auto mb-6">
                     <LayoutGrid size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-plano-900 uppercase">No Subscriptions Found</h3>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Go to the shop to browse available packages.</p>
               </div>
            ) : null}
         </div>

         {/* Footer Help */}
         <div className="mt-12 p-8 bg-white border border-plano-50 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center shadow-inner">
                  <RefreshCw size={24} />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-plano-900 uppercase tracking-tight">Instant Renewal Enabled</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Click on any active order to renew or modify billing details.</p>
               </div>
            </div>
            <button className="h-14 px-8 rounded-2xl border border-plano-100 text-plano-600 text-xs font-bold uppercase tracking-widest hover:border-plano-600 hover:bg-plano-50 transition-all">
               Contact Billing Support
            </button>
         </div>
      </div>
   );
}
