'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
   ArrowLeft, Download, RefreshCw, XCircle, Package, Calendar,
   MapPin, FileText, CheckCircle2, ChevronRight, Loader2, ArrowRight,
   ShieldCheck, AlertCircle, Clock, Info, Printer, Pause, Play, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Subscription, Invoice, Plan } from '@/types';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function getCycleProgress(startDate?: string, endDate?: string) {
   if (!startDate || !endDate) return 0;
   const start = new Date(startDate).getTime();
   const end = new Date(endDate).getTime();
   const now = Date.now();
   if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
   return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
}

export default function OrderDetailPage() {
   const { orderId } = useParams();
   const router = useRouter();
   const { success: toastSuccess, error: toastError } = useToast();

   const [order, setOrder] = useState<Subscription | null>(null);
   const [invoices, setInvoices] = useState<Invoice[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isRenewing, setIsRenewing] = useState(false);
   const [isClosing, setIsClosing] = useState(false);
   const [isUpdatingRenewal, setIsUpdatingRenewal] = useState(false);

   useEffect(() => {
      async function fetchData() {
         try {
            const [subRes, invsRes] = await Promise.all([
               api.subscriptions.getById(orderId as string),
               api.invoices.getAll({ subscriptionId: orderId })
            ]);

            if (subRes.success) setOrder(subRes.data);
            if (invsRes.success) {
               const invoicesData = invsRes.data as Invoice[] | { invoices?: Invoice[] };
               const invoiceList = Array.isArray(invoicesData) ? invoicesData : (invoicesData.invoices ?? []);
               setInvoices(invoiceList);
            }
         } catch (err) {
            console.error('Failed to load order details', err);
            toastError('Unable to load order', err instanceof Error ? err.message : 'The requested order was not found.');
         } finally {
            setIsLoading(false);
         }
      }
      fetchData();
   }, [orderId, toastError]);

   const handleRenew = async () => {
      if (!order) return;
      setIsRenewing(true);
      try {
         // Renewal creates a new subscription order using the current plan.
         const res = await api.subscriptions.create({
            productId: typeof order.productId === 'object' ? order.productId.id : order.productId,
            planId: typeof order.planId === 'object' ? order.planId.id : order.planId,
            quantity: order.quantity
         });
         if (res.success) {
            toastSuccess('Renewed!', 'A renewal order has been successfully generated.');
            router.push('/portal/account/orders');
         }
      } catch (err: any) {
         toastError('Renewal Failed', err.message || 'Unable to renew at this time.');
      } finally {
         setIsRenewing(false);
      }
   };

   const handlePause = async () => {
      if (!order || isLoading) return;
      try {
         const res = await api.subscriptions.pause(order.id);
         if (res.success) {
            toastSuccess('Paused', 'Your subscription has been temporarily paused.');
            setOrder(prev => prev ? { ...prev, status: 'paused' } : null);
         }
      } catch (err: any) {
         toastError('Pause Failed', err.message);
      }
   };

   const handleResume = async () => {
      if (!order || isLoading) return;
      try {
         const res = await api.subscriptions.resume(order.id);
         if (res.success) {
            toastSuccess('Resumed!', 'Your service is now active again.');
            setOrder(prev => prev ? { ...prev, status: 'active' } : null);
         }
      } catch (err: any) {
         toastError('Resume Failed', err.message);
      }
   };

   const handleClose = async () => {
      if (!order || isClosing) return;
      setIsClosing(true);
      try {
         const res = await api.subscriptions.cancel(order.id, 'Customer requested closure via portal');
         if (res.success) {
            toastSuccess('Cancelled', 'Your subscription is now pending closure.');
            setOrder(prev => prev ? { ...prev, status: 'cancelled' as const } : null);
         }
      } catch (err: any) {
         toastError('Cancellation Failed', err.message || 'Unable to cancel subscription.');
      } finally {
         setIsClosing(false);
      }
   };

   const handleToggleAutoRenew = async () => {
      if (!order) return;
      setIsUpdatingRenewal(true);
      try {
         const res = await api.subscriptions.update(order.id, { autoRenew: !order.autoRenew });
         if (res.success) {
            toastSuccess(
               order.autoRenew ? 'Auto-renew disabled' : 'Auto-renew enabled',
               order.autoRenew ? 'This subscription will not renew automatically.' : 'This subscription will renew automatically.'
            );
            setOrder((prev) => (prev ? { ...prev, autoRenew: !prev.autoRenew } : prev));
         }
      } catch (err: any) {
         toastError('Auto-renew update failed', err.message || 'Unable to update recurrence settings.');
      } finally {
         setIsUpdatingRenewal(false);
      }
   };

   if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-plano-600" size={32} />
         </div>
      );
   }

   if (!order) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-danger-50 flex items-center justify-center text-danger-500 mb-6 font-mono text-4xl">404</div>
            <h2 className="text-2xl font-bold text-plano-900 mb-4 uppercase">Order Not Found</h2>
            <Link href="/portal/account/orders" className="btn-primary">Back to Subscriptions</Link>
         </div>
      );
   }

   const productName = typeof order.productId === 'object' ? order.productId.name : 'Subscription Package';
   const planName = typeof order.planId === 'object' ? order.planId.name : 'Plan details';
   const planCycle = typeof order.planId === 'object' ? order.planId.billingCycle : 'recurring';
   const cycleProgress = getCycleProgress(order.startDate, order.endDate);

   return (
      <div className="max-w-7xl mx-auto px-6 py-12">
         {/* Top Banner & Breadcrumb */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-4">
               <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  <Link href="/portal/account/orders" className="hover:text-plano-600 transition-colors uppercase">All Orders</Link>
                  <ChevronRight size={10} />
                  <span className="text-plano-900 font-mono tracking-widest">{order.id}</span>
               </nav>
               <div className="flex flex-wrap items-center gap-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-plano-900 uppercase tracking-tighter leading-none italic">{productName}</h1>
                  <div className={cn(
                     "px-4 py-1.5 rounded-2xl border flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white shadow-sm",
                     order.status === 'active' ? "text-success-600 border-success-100" : order.status === 'paused' ? "text-warning-600 border-warning-100" : "text-gray-400 border-gray-100"
                  )}>
                     <div className={cn("w-2 h-2 rounded-full", order.status === 'active' ? "bg-success-600 animate-pulse" : order.status === 'paused' ? "bg-warning-500" : "bg-gray-300")} />
                     {order.status}
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
               {/* Renew Button */}
               {(order.planId as any)?.isRenewable !== false && (
                  <button
                     onClick={handleRenew}
                     disabled={isRenewing || order.status === 'cancelled'}
                     className="h-14 px-8 rounded-2xl bg-plano-600 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-plano-900 shadow-xl shadow-plano-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                  >
                     {isRenewing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />}
                     Renew Now
                  </button>
               )}

               <button
                  onClick={handleToggleAutoRenew}
                  disabled={isUpdatingRenewal || order.status === 'cancelled'}
                  className={cn(
                     'h-14 px-8 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
                     order.autoRenew
                        ? 'border border-success-100 bg-success-50/40 text-success-700 hover:bg-success-50'
                        : 'border border-gray-200 bg-white text-gray-500 hover:border-plano-300 hover:text-plano-600'
                  )}
               >
                  {isUpdatingRenewal ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  {order.autoRenew ? 'Auto-renew ON' : 'Auto-renew OFF'}
               </button>

               {/* Pause/Resume Logic */}
               {(order.planId as any)?.isPausable !== false && order.status === 'active' && (
                  <button
                     onClick={handlePause}
                     className="h-14 px-8 rounded-2xl border border-warning-100 bg-warning-50/20 text-warning-600 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-warning-50 transition-all group active:scale-95 shadow-sm"
                  >
                     <Pause size={18} className="group-hover:scale-110 transition-transform" />
                     Pause
                  </button>
               )}

               {order.status === 'paused' && (
                  <button
                     onClick={handleResume}
                     className="h-14 px-8 rounded-2xl bg-success-600 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-success-700 transition-all group active:scale-95 shadow-lg shadow-success-600/20"
                  >
                     <Play size={18} className="group-hover:translate-x-1 transition-transform" />
                     Resume
                  </button>
               )}

               {/* Close/Cancel Logic */}
               {(order.planId as any)?.isClosable !== false && order.status !== 'cancelled' && (
                  <button
                     onClick={handleClose}
                     disabled={isClosing}
                     className="h-14 px-8 rounded-2xl border border-danger-100 text-danger-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-danger-50 shadow-sm transition-all active:scale-95 group"
                  >
                     {isClosing ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} className="group-hover:scale-110 transition-transform" />}
                     Cancel Service
                  </button>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
               {/* Core Details Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 border-b border-plano-50">
                  <div>
                     <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Package size={14} className="text-plano-300" />
                        Your Subscription
                     </h3>
                     <div className="p-8 rounded-[2.5rem] bg-white border border-plano-50 shadow-sm relative overflow-hidden group hover:border-plano-200 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                           <CheckCircle2 size={64} className="text-success-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Active Plan</p>
                        <h4 className="text-2xl font-bold text-plano-900 uppercase tracking-tight mb-6">{planName}</h4>

                        <div className="mb-6 flex items-center gap-2 flex-wrap">
                           <span className="px-2.5 py-1 rounded-full bg-plano-50 border border-plano-100 text-[10px] font-bold uppercase tracking-widest text-plano-600">
                              {planCycle} cycle
                           </span>
                           <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                              {order.autoRenew ? 'Auto-renew enabled' : 'Auto-renew off'}
                           </span>
                        </div>

                        <div className="mb-6">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cycle Progress</span>
                              <span className="text-[10px] font-bold text-plano-600 tabular-nums">{cycleProgress}%</span>
                           </div>
                           <div className="h-2 rounded-full bg-plano-50 overflow-hidden">
                              <div
                                 className={cn(
                                    'h-full rounded-full bg-gradient-to-r from-plano-500 to-plano-600 transition-all',
                                    order.status === 'paused' ? 'from-warning-400 to-warning-500' : order.status === 'cancelled' ? 'from-gray-300 to-gray-400' : ''
                                 )}
                                 style={{ width: `${cycleProgress}%` }}
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase font-bold text-gray-400 opacity-60">Created Date</span>
                              <span className="text-xs font-bold text-plano-900">{format(new Date(order.startDate), 'MMM dd, yyyy')}</span>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase font-bold text-gray-400 opacity-60">End Period</span>
                              <span className="text-xs font-bold text-plano-900">{format(new Date(order.endDate), 'MMM dd, yyyy')}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <MapPin size={14} className="text-plano-300" />
                        Service Info
                     </h3>
                     <div className="p-8 rounded-[2.5rem] border border-plano-100 bg-plano-50/20 relative group hover:bg-white transition-all">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-10 h-10 rounded-xl bg-white border border-plano-50 flex items-center justify-center text-plano-600 shadow-sm">
                              <ShieldCheck size={20} />
                           </div>
                           <h4 className="text-xs font-bold uppercase tracking-widest text-plano-900">Billing Address</h4>
                        </div>
                        <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-tighter">
                           {order.id} • Registered to Client Gateway<br />
                           Verified via Portal Session Auth<br />
                           Digital Cloud Receipt Mode Enabled
                        </p>
                     </div>
                  </div>
               </div>

               {/* Invoices Table */}
               <div>
                  <h3 className="text-xs font-bold text-plano-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                     <FileText size={18} className="text-plano-600" />
                     Transaction Statements
                  </h3>
                  <div className="bg-white rounded-[2.5rem] border border-plano-100 overflow-hidden shadow-xl shadow-plano-600/5">
                     <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 bg-plano-50/30 border-b border-plano-50">
                        <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inv Number</div>
                        <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</div>
                        <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</div>
                        <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</div>
                     </div>

                     <div className="divide-y divide-plano-50">
                        {invoices.length > 0 ? invoices.map((inv) => (
                           <Link
                              key={inv.id}
                              href={`/portal/account/orders/${order.id}/invoices/${inv.id}`}
                              className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-8 lg:px-8 lg:py-6 items-center hover:bg-plano-50 transition-all group"
                           >
                              <div className="col-span-12 lg:col-span-3 flex items-center gap-4">
                                 <span className="text-sm font-bold text-plano-900 font-mono tracking-widest uppercase group-hover:text-plano-600 transition-colors">{inv.invoiceNumber}</span>
                              </div>
                              <div className="col-span-6 lg:col-span-3 text-sm font-medium text-gray-500">
                                 {format(new Date(inv.issueDate), 'MMM dd, yyyy')}
                              </div>
                              <div className="col-span-6 lg:col-span-3">
                                 {inv.status === 'paid' ? (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-success-600 uppercase tracking-widest bg-success-50 px-3 py-1 rounded-full border border-success-100"><CheckCircle2 size={12} strokeWidth={3} /> Paid</span>
                                 ) : inv.status === 'overdue' ? (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-danger-500 uppercase tracking-widest bg-danger-50 px-3 py-1 rounded-full border border-danger-100"><AlertCircle size={12} strokeWidth={3} /> Overdue</span>
                                 ) : (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100"><Clock size={12} strokeWidth={3} /> {inv.status}</span>
                                 )}
                              </div>
                              <div className="col-span-12 lg:col-span-3 text-right text-lg font-bold text-plano-900 tabular-nums">
                                 ₹{inv.totalAmount.toLocaleString()}
                              </div>
                           </Link>
                        )) : (
                           <div className="p-12 text-center text-gray-400 font-medium italic">No invoices found for this subscription yet.</div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Sidebar: Item Breakdown */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
               <div className="bg-white rounded-[2.5rem] border border-plano-100 p-8 shadow-xl shadow-plano-600/5 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-plano-600">
                     <Star size={64} fill="currentColor" stroke="none" />
                  </div>

                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2 underline underline-offset-8 decoration-plano-200 decoration-4">
                     Purchase Statement
                  </h3>

                  <div className="space-y-6">
                     <div className="pb-6 border-b border-plano-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 italic">Itemized Costs</p>
                        <div className="flex items-center justify-between gap-4">
                           <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-plano-50 border border-plano-100 flex items-center justify-center text-plano-600 flex-shrink-0">
                                 <Package size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-plano-900 uppercase leading-tight line-clamp-2">{productName}</p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">QTY: {order.quantity}</p>
                              </div>
                           </div>
                           <span className="text-md font-bold text-plano-900 tabular-nums">₹{order.unitPrice.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                           <span>Untaxed Amount</span>
                           <span className="text-plano-900 tabular-nums">₹{order.totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                           <span>Tax Calculation</span>
                           <span className="text-plano-900 tabular-nums">₹{order.taxApplied.toLocaleString()}</span>
                        </div>
                        {order.discountApplied > 0 && (
                           <div className="flex justify-between items-center text-xs font-bold text-success-600 uppercase tracking-widest bg-success-50 p-3 rounded-2xl border border-success-100">
                              <span>Discount Applied</span>
                              <span className="text-lg font-bold">−₹{order.discountApplied.toLocaleString()}</span>
                           </div>
                        )}
                        <div className="h-px bg-plano-50 w-full" />
                        <div className="flex justify-between items-end">
                           <span className="text-xs font-bold text-plano-600 uppercase tracking-[0.2em] mb-1 shadow-sm px-2 bg-plano-50 rounded">Bill Period Total</span>
                           <span className="text-4xl font-bold text-plano-900 tabular-nums">₹{order.grandTotal.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 p-6 bg-plano-50/50 rounded-3xl flex gap-4 border border-plano-50">
                     <Info size={18} className="text-plano-600 flex-shrink-0" />
                     <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-widest">
                        Subscriptions are billed upfront. Any changes in plan or early closure may lead to credit adjustments on your next cycle.
                     </p>
                  </div>
               </div>

               <button className="w-full h-14 rounded-2xl bg-white border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:border-plano-600 hover:shadow-lg transition-all shadow-sm">
                  <Printer size={18} />
                  Print Receipt
               </button>
            </div>
         </div>
      </div>
   );
}
