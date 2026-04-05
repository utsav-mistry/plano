'use client';

import React, { useEffect, useState } from 'react';
import {
   Calculator, FileText, ArrowRight, Search,
   Filter, Loader2, Sparkles, CheckCircle2,
   Clock, XCircle, ChevronRight, FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Quotation } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function MyQuotesPage() {
   const [quotes, setQuotes] = useState<Quotation[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [search, setSearch] = useState('');
   const { error: toastError } = useToast();

   function handleViewPdf(quote: Quotation) {
      const pdfUrl = (quote as Quotation & { pdfUrl?: string }).pdfUrl;
      if (!pdfUrl) {
         toastError('PDF unavailable', 'This quotation PDF is not generated yet.');
         return;
      }
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
   }

   async function handleAcceptQuote(quote: Quotation) {
      if (quote.status !== 'accepted') {
         toastError('Quote not ready', 'This quotation must be approved by billing before conversion.');
         return;
      }

      try {
         const res = await api.quotations.convert(quote.id);
         if (!res.success) {
            throw new Error('Unable to convert quotation');
         }
         window.location.href = '/portal/account/orders';
      } catch (err) {
         toastError('Conversion failed', err instanceof Error ? err.message : 'Unable to accept quote right now.');
      }
   }

   useEffect(() => {
      async function fetchQuotes() {
         try {
            const res = await api.quotations.getAll();
            if (res.success) {
               const data = res.data as Quotation[] | { quotations?: Quotation[] };
               const all = Array.isArray(data) ? data : (data?.quotations || []);
               setQuotes(all);
            }
         } catch (err) {
            console.error('Failed to fetch quotations', err);
            toastError('Unable to load quotations', err instanceof Error ? err.message : 'Please refresh and try again.');
         } finally {
            setIsLoading(false);
         }
      }
      fetchQuotes();
   }, [toastError]);

   const filtered = quotes.filter(q =>
      q.id.toLowerCase().includes(search.toLowerCase()) ||
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      (typeof q.userId === 'object' && q.userId.name.toLowerCase().includes(search.toLowerCase()))
   );

   if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-plano-600" size={32} />
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto px-6 py-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plano-50 border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">
                  <Calculator size={14} />
                  Quotation Portal
               </div>
               <h1 className="text-4xl font-bold text-plano-900 uppercase tracking-tighter mb-4 leading-none italic">Manage Quotes</h1>
               <p className="text-gray-500 font-medium leading-relaxed">View all active quotations and service estimates. In accordance with Section 10 of the system requirements, these are pre-validated templates ready for conversion.</p>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative group flex-1 md:w-64">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                     type="text"
                     placeholder="Find quote by ID..."
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="h-12 w-full pl-12 pr-4 rounded-2xl bg-white border border-plano-100 text-sm font-bold text-plano-900 outline-none focus:border-plano-600 transition-all uppercase tracking-widest placeholder:text-[10px]"
                  />
               </div>
            </div>
         </div>

         {/* Quotes List */}
         <div className="space-y-4">
            <AnimatePresence mode="popLayout">
               {filtered.length > 0 ? filtered.map((quote, i) => (
                  <motion.div
                     key={quote.id}
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.05 }}
                  >
                     <div className="block bg-white rounded-3xl border border-plano-50 p-6 hover:border-plano-600 hover:shadow-2xl hover:shadow-plano-600/5 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-plano-900 pointer-events-none group-hover:scale-110 transition-transform">
                           <FileText size={120} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                           <div className="md:col-span-4 flex items-center gap-6">
                              <div className="w-16 h-16 rounded-2xl bg-plano-50 flex items-center justify-center text-plano-600 flex-shrink-0 group-hover:bg-plano-600 group-hover:text-white transition-colors shadow-sm">
                                 <Sparkles size={28} strokeWidth={1.5} />
                              </div>
                              <div>
                                 <span className="text-[10px] font-bold text-plano-600 uppercase tracking-widest block mb-1">Quotation #</span>
                                 <h4 className="text-lg font-bold text-plano-900 uppercase tracking-tight">{quote.quotationNumber}</h4>
                              </div>
                           </div>

                           <div className="md:col-span-3">
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Customer</span>
                                 <span className="text-sm font-bold text-plano-900 uppercase">{typeof quote.userId === 'object' ? quote.userId.name : 'Portal Customer'}</span>
                              </div>
                           </div>

                           <div className="md:col-span-2">
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Est. Total</span>
                                 <span className="text-xl font-bold text-plano-900 tabular-nums">₹{quote.totalAmount.toLocaleString()}</span>
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Status: {quote.status}</span>
                              </div>
                           </div>

                           <div className="md:col-span-3 flex justify-end gap-3">
                              <button
                                 onClick={() => handleViewPdf(quote)}
                                 className="h-12 px-6 rounded-xl border border-plano-100 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-plano-600 hover:border-plano-600 transition-all"
                              >
                                 View PDF
                              </button>
                              <button
                                 onClick={() => handleAcceptQuote(quote)}
                                 className="h-12 px-6 rounded-xl bg-plano-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-plano-900 transition-all shadow-lg shadow-plano-600/20 flex items-center gap-2"
                              >
                                 Accept Quote
                                 <ArrowRight size={14} />
                              </button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )) : (
                  <div className="py-24 text-center">
                     <div className="w-20 h-20 rounded-3xl bg-plano-50 flex items-center justify-center text-gray-200 mx-auto mb-8 shadow-inner">
                        <FileSearch size={40} strokeWidth={1} />
                     </div>
                     <h3 className="text-xl font-bold text-plano-900 uppercase">No active quotations found</h3>
                     <p className="text-sm font-medium text-gray-400 uppercase tracking-widest max-w-sm mx-auto mt-4 leading-relaxed">All your service estimates and quotation templates will appear here after initial contact with billing.</p>
                  </div>
               )}
            </AnimatePresence>
         </div>

         {/* Section 10 Info */}
         <div className="mt-16 p-8 bg-plano-900 rounded-[3rem] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-plano-600 opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-plano-600 flex items-center justify-center">
                        <Sparkles size={16} />
                     </div>
                     <h4 className="text-lg font-bold uppercase tracking-tight">Accelerated Setups (Module 10)</h4>
                  </div>
                  <p className="text-white/60 text-sm font-medium leading-relaxed uppercase tracking-widest">Predefined quotation templates are used to speed up your subscription setup process. Once a template is accepted, your billing cycle begins automatically.</p>
               </div>
               <button className="h-14 px-10 rounded-2xl bg-white text-plano-900 font-bold text-[10px] uppercase tracking-widest hover:bg-plano-100 transition-all shadow-xl group-hover:scale-105">
                  Request Custom Quote
               </button>
            </div>
         </div>
      </div>
   );
}
