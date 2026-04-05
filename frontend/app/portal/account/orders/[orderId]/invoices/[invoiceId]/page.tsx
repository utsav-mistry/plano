'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
   ArrowLeft, ArrowRight, Download, CreditCard, FileText, Calendar,
   MapPin, CheckCircle2, ChevronRight, Loader2, IndianRupee,
   ShieldCheck, AlertCircle, Clock, Info, Printer, ShoppingBag,
   Zap, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Invoice, Subscription } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function InvoiceDetailPage() {
   const { orderId, invoiceId } = useParams();
   const router = useRouter();
   const { success: toastSuccess, error: toastError } = useToast();

   const [invoice, setInvoice] = useState<Invoice | null>(null);
   const [order, setOrder] = useState<Subscription | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isPaying, setIsPaying] = useState(false);

   useEffect(() => {
      async function fetchData() {
         try {
            const [invRes, subRes] = await Promise.all([
               api.invoices.getById(invoiceId as string),
               api.subscriptions.getById(orderId as string)
            ]);

            if (invRes.success) setInvoice(invRes.data);
            if (subRes.success) setOrder(subRes.data);
         } catch (err) {
            console.error('Failed to load invoice details', err);
            toastError('Unable to load invoice', err instanceof Error ? err.message : 'The requested invoice was not found.');
         } finally {
            setIsLoading(false);
         }
      }
      fetchData();
   }, [invoiceId, orderId, toastError]);

   const handlePayment = async () => {
      if (!invoice || isPaying) return;
      setIsPaying(true);
      try {
         const amount = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.totalAmount;
         const subscriptionId = typeof invoice.subscriptionId === 'object' ? invoice.subscriptionId.id : invoice.subscriptionId;

         const paymentRes = await api.payments.record({
            invoiceId: invoice.id,
            subscriptionId,
            amount,
            currency: 'INR',
            method: 'upi',
            gateway: 'razorpay',
         });

         if (!paymentRes.success) {
            throw new Error('Payment could not be recorded');
         }

         const freshInvoiceRes = await api.invoices.getById(invoice.id);
         if (freshInvoiceRes.success) {
            setInvoice(freshInvoiceRes.data);
         }
         toastSuccess('Payment Received', 'Your invoice has been marked as paid successfully.');
      } catch (err: any) {
         toastError('Payment Error', err.message || 'Unable to process payment right now.');
      } finally {
         setIsPaying(false);
      }
   };

   const handleDownload = async () => {
      if (!invoice) return;
      try {
         const response = await api.invoices.downloadPdf(invoice.id);
         if (!response.ok) {
            throw new Error('Failed to download invoice');
         }
         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `${invoice.invoiceNumber || `Invoice-${invoice.id}`}.pdf`;
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         toastSuccess('Download Started', 'Your invoice PDF is downloading.');
      } catch (err) {
         toastError('Download Failed', err instanceof Error ? err.message : 'Unable to download invoice right now.');
      }
   };

   if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-plano-600" size={32} />
         </div>
      );
   }

   if (!invoice) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-danger-50 flex items-center justify-center text-danger-500 mb-6 font-mono text-4xl">404</div>
            <h2 className="text-2xl font-bold text-plano-900 mb-4 uppercase">Invoice Not Found</h2>
            <Link href={`/portal/account/orders/${orderId}`} className="btn-primary">Back to Order</Link>
         </div>
      );
   }

   const productName = order && typeof order.productId === 'object' ? order.productId.name : 'Subscription Product';

   return (
      <div className="max-w-7xl mx-auto px-6 py-12">
         {/* Breadcrumb & Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4">
               <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  <Link href="/portal/account/orders" className="hover:text-plano-600 transition-colors uppercase">All Orders</Link>
                  <ChevronRight size={10} />
                  <Link href={`/portal/account/orders/${orderId}`} className="hover:text-plano-600 transition-colors font-mono uppercase tracking-widest">{orderId}</Link>
                  <ChevronRight size={10} />
                  <span className="text-plano-900 font-mono tracking-widest">{invoice.invoiceNumber}</span>
               </nav>
               <div className="flex flex-wrap items-center gap-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-plano-900 uppercase tracking-tighter leading-none italic">Invoice Statement</h1>
                  {invoice.status === 'paid' ? (
                     <div className="px-5 py-2 rounded-full border border-success-100 bg-success-50 text-success-600 flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <CheckCircle2 size={16} strokeWidth={3} />
                        Fully Paid
                     </div>
                  ) : (
                     <div className={cn(
                        "px-5 py-2 rounded-full border flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white shadow-sm",
                        invoice.status === 'overdue' ? "text-danger-500 border-danger-100" : "text-gray-400 border-gray-100"
                     )}>
                        <Clock size={16} strokeWidth={3} />
                        {invoice.status}
                     </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button
                  onClick={handleDownload}
                  className="h-14 px-8 rounded-2xl border border-plano-100 bg-white text-plano-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:border-plano-600 hover:shadow-lg transition-all group"
               >
                  <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                  Download PDF
               </button>
               {invoice.status !== 'paid' && (
                  <button
                     onClick={handlePayment}
                     disabled={isPaying}
                     className="h-14 px-8 rounded-2xl bg-plano-600 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-plano-900 shadow-xl shadow-plano-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                  >
                     {isPaying ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} className="group-hover:scale-110 transition-transform" />}
                     Complete Payment
                  </button>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 flex flex-col gap-12">
               {/* Meta Data Box */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 bg-white rounded-[2.5rem] border border-plano-50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Zap size={64} className="text-plano-600" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Invoice Ref</p>
                     <span className="text-sm font-bold text-plano-900 font-mono tracking-widest">{invoice.invoiceNumber}</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Statement Date</p>
                     <span className="text-sm font-bold text-plano-900">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Due Date</p>
                     <span className={cn(
                        "text-sm font-bold",
                        new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? "text-danger-500" : "text-plano-900"
                     )}>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Customer ID</p>
                     <span className="text-sm font-bold text-plano-900 font-mono tracking-widest">USER_GATEWAY</span>
                  </div>
               </div>

               {/* Line Items Table */}
               <div className="space-y-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                     <ShoppingBag size={14} />
                     Service Particulars
                  </h3>
                  <div className="bg-white rounded-[2.5rem] border border-plano-50 overflow-hidden shadow-sm">
                     <div className="hidden md:grid grid-cols-12 p-6 bg-plano-50/20 border-b border-plano-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Rate</div>
                        <div className="col-span-2 text-right">Amount</div>
                     </div>
                     <div className="divide-y divide-plano-50">
                        {invoice.items.map((item, i) => (
                           <div key={i} className="grid grid-cols-1 md:grid-cols-12 p-8 md:p-6 items-center gap-4">
                              <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                                 <div className="w-10 h-10 rounded-xl bg-plano-100 flex items-center justify-center text-plano-600 flex-shrink-0 shadow-inner">
                                    <FileText size={20} />
                                 </div>
                                 <div className="grid">
                                    <span className="text-sm font-bold text-plano-900 uppercase leading-tight">{item.description}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Product Sku: {invoice.subscriptionId as string}</span>
                                 </div>
                              </div>
                              <div className="col-span-4 md:col-span-2 text-center text-sm font-bold text-plano-900">
                                 {item.quantity}
                              </div>
                              <div className="col-span-4 md:col-span-2 text-right text-sm font-bold text-gray-400">
                                 ₹{item.unitPrice.toLocaleString()}
                              </div>
                              <div className="col-span-4 md:col-span-2 text-right text-md font-bold text-plano-900 tabular-nums">
                                 ₹{item.amount.toLocaleString()}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Support Message */}
               <div className="p-8 bg-info-50/50 border border-info-100 rounded-[2rem] flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-info-100 text-info-700 flex items-center justify-center shadow-inner flex-shrink-0">
                     <ShieldCheck size={24} />
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-sm font-bold text-plano-900 uppercase">Billing Information</h4>
                     <p className="text-[11px] font-medium text-gray-500 leading-relaxed uppercase tracking-widest">For any disputes regarding this statement, please reference your invoice number when contacting the Plano account department. Electronic receipts are generated instantly upon payout.</p>
                  </div>
               </div>
            </div>

            {/* Right Sidebar: Summary Breakdown */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
               <div className="bg-white rounded-[2.5rem] border border-plano-100 p-8 shadow-xl shadow-plano-600/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-plano-600">
                     <Star size={64} fill="currentColor" stroke="none" />
                  </div>

                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2 underline underline-offset-8 decoration-plano-200 decoration-4">
                     Financial Review
                  </h3>

                  <div className="space-y-6">
                     <div className="pb-6 border-b border-plano-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 italic">Itemized Costs</p>
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                           <span>Statement Subtotal</span>
                           <span className="text-plano-900 tabular-nums">₹{invoice.subtotal.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                           <span>GST / Service Tax</span>
                           <span className="text-plano-900 tabular-nums">₹{invoice.taxAmount.toLocaleString()}</span>
                        </div>
                        {invoice.discountAmount > 0 && (
                           <div className="flex justify-between items-center text-xs font-bold text-success-600 uppercase tracking-widest bg-success-50 p-3 rounded-2xl border border-success-100">
                              <span>Account Discount</span>
                              <span className="text-lg font-bold">−₹{invoice.discountAmount.toLocaleString()}</span>
                           </div>
                        )}
                        <div className="h-px bg-plano-50 w-full" />
                        <div className="flex justify-between items-end">
                           <span className="text-xs font-bold text-plano-600 uppercase tracking-[0.1em] mb-1 shadow-sm px-2 bg-plano-50 rounded">Grand Total Due</span>
                           <span className="text-4xl font-bold text-plano-900 tabular-nums">₹{invoice.totalAmount.toLocaleString()}</span>
                        </div>
                     </div>

                     {invoice.status === 'paid' && invoice.paidAt && (
                        <div className="mt-8 pt-8 border-t border-plano-50 space-y-4">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Received on</p>
                           <div className="p-4 rounded-2xl bg-success-50 border border-success-100 text-success-600 flex items-center justify-between">
                              <CheckCircle2 size={18} />
                              <span className="text-xs font-bold uppercase tracking-widest">{format(new Date(invoice.paidAt), 'MMMM dd, HH:mm')}</span>
                           </div>
                        </div>
                     )}

                     {invoice.status !== 'paid' && (
                        <div className="mt-8 pt-8 border-t border-plano-50 space-y-4">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic text-center">Amount Payable</p>
                           <h2 className="text-3xl font-bold text-plano-900 text-center tabular-nums">₹{invoice.balanceDue.toLocaleString()}</h2>
                           <button
                              onClick={handlePayment}
                              disabled={isPaying}
                              className="w-full h-16 rounded-[2rem] bg-plano-600 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-plano-900 shadow-xl shadow-plano-600/20 transition-all group"
                           >
                              {isPaying ? <Loader2 className="animate-spin" size={18} /> : <>PAY STATEMENT <ArrowRight size={18} /></>}
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               <button
                  onClick={() => { if (typeof window !== 'undefined') window.print(); }}
                  className="w-full h-14 rounded-2xl bg-white border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:border-plano-600 transition-all shadow-sm group"
               >
                  <Printer size={18} className="group-hover:scale-110 transition-transform" />
                  Print Invoice
               </button>
            </div>
         </div>
      </div>
   );
}
