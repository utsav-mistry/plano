'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart3, TrendingUp, CreditCard, AlertCircle, 
  ChevronRight, Calendar, Filter, Download, ArrowUpRight,
  PieChart as PieIcon, Activity, IndianRupee
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Subscription, Invoice, Payment } from '@/types';
import { useAuth } from '@/app/context/AuthContext';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllAnalytics() {
      try {
        const [subRes, invRes, payRes] = await Promise.all([
          api.subscriptions.getAll(),
          api.invoices.getAll(),
          api.payments.getAll()
        ]);
        
        if (subRes.success) {
          const data = subRes.data as any;
          setSubscriptions(Array.isArray(data) ? data : (data?.subscriptions || []));
        }
        if (invRes.success) {
           const data = invRes.data as any;
           setInvoices(Array.isArray(data) ? data : (data?.invoices || []));
        }
        if (payRes.success) {
           const data = payRes.data as any;
           setPayments(Array.isArray(data) ? data : (data?.payments || []));
        }
      } catch (err) {
        console.error('Analytics Fetch Error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllAnalytics();
    
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = 'auto'; };
  }, []);

  // Compute Metrics
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const mrr = activeSubs.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalPaid = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const stats = [
    { label: 'Active Subscriptions', value: activeSubs.length, icon: Activity, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Monthly Revenue (MRR)', value: `₹${mrr.toLocaleString()}`, icon: TrendingUp, color: 'text-plano-600', bg: 'bg-plano-50' },
    { label: 'Total Settled', value: `₹${totalPaid.toLocaleString()}`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Overdue Invoices', value: overdueCount, icon: AlertCircle, color: 'text-danger-600', bg: 'bg-danger-50' },
  ];

  const distribution = useMemo(() => {
    const total = subscriptions.length || 1;
    const active = (subscriptions.filter(s => s.status === 'active').length / total) * 100;
    const quote = (subscriptions.filter(s => s.status === 'quotation').length / total) * 100;
    const cancelled = (subscriptions.filter(s => ['cancelled', 'closed'].includes(s.status)).length / total) * 100;
    return { active, quote, cancelled };
  }, [subscriptions]);

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-gray-25/50 flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-6 flex flex-col gap-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-plano-600 animate-pulse" />
              <span className="text-[10px] font-bold text-plano-600 uppercase tracking-[0.2em]">Real-Time Business Intelligence</span>
            </div>
            <h1 className="text-3xl font-bold text-plano-900 tracking-tight uppercase italic">Ecosystem <span className="text-plano-600 font-caveat text-4xl normal-case not-italic">Analytics</span></h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="h-10 px-4 rounded-xl border border-plano-100 bg-white text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-plano-600 transition-all flex items-center gap-2">
              <Download size={14} />
              Export PDF
            </button>
            <button className="h-10 px-4 rounded-xl bg-plano-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-plano-600 transition-all shadow-lg flex items-center gap-2">
              <Filter size={14} />
              Filter View
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-3xl border border-plano-50 shadow-sm group hover:border-plano-200 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ArrowUpRight size={10} />
                  +12%
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-plano-900 leading-none">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Center Piece */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* Status Distribution */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-plano-50 shadow-sm p-8 flex flex-col min-h-0 overflow-hidden">
             <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <h3 className="text-xs font-bold text-plano-900 uppercase tracking-widest flex items-center gap-2">
                   <BarChart3 size={16} className="text-plano-600" />
                   Lifecycle Status Distribution
                </h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Last 30 Days Breakdown</span>
             </div>
             
             <div className="flex-1 flex flex-col justify-center">
                <div className="w-full h-12 bg-gray-50 rounded-2xl overflow-hidden flex mb-8">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${distribution.active}%` }} className="bg-plano-600 h-full relative group">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-plano-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Active: {distribution.active.toFixed(1)}%</div>
                   </motion.div>
                   <motion.div initial={{ width: 0 }} animate={{ width: `${distribution.quote}%` }} className="bg-plano-300 h-full relative group">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-plano-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Quote: {distribution.quote.toFixed(1)}%</div>
                   </motion.div>
                   <motion.div initial={{ width: 0 }} animate={{ width: `${distribution.cancelled}%` }} className="bg-gray-200 h-full relative group">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-plano-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Closed: {distribution.cancelled.toFixed(1)}%</div>
                   </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                   <div className="space-y-2">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-plano-600" />
                         <span className="text-[10px] font-bold text-plano-900 uppercase">Active Ecosystem</span>
                      </div>
                      <p className="text-2xl font-bold text-plano-900">{activeSubs.length} <span className="text-xs text-gray-400 font-medium">PLANS</span></p>
                      <p className="text-[9px] text-gray-400 font-medium leading-relaxed">Subscriptions currently generating recurring revenue.</p>
                   </div>
                   <div className="space-y-2 border-l border-plano-50 pl-8">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-plano-300" />
                         <span className="text-[10px] font-bold text-plano-900 uppercase">Pending Quotes</span>
                      </div>
                      <p className="text-2xl font-bold text-plano-900">{subscriptions.filter(s => s.status === 'quotation').length} <span className="text-xs text-gray-400 font-medium">REVIEWS</span></p>
                      <p className="text-[9px] text-gray-400 font-medium leading-relaxed">Orders awaiting sales team verification & approval.</p>
                   </div>
                   <div className="space-y-2 border-l border-plano-50 pl-8">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-gray-200" />
                         <span className="text-[10px] font-bold text-plano-900 uppercase">Settled/Closed</span>
                      </div>
                      <p className="text-2xl font-bold text-plano-900">{subscriptions.filter(s => ['cancelled', 'closed'].includes(s.status)).length} <span className="text-xs text-gray-400 font-medium">HISTORIC</span></p>
                      <p className="text-[9px] text-gray-400 font-medium leading-relaxed">Subscriptions that have already reached end-of-life.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Panel: Performance Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
             
             {/* Mini Billing Summary */}
             <div className="bg-plano-900 rounded-[2rem] p-6 text-white relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-plano-600 opacity-20 blur-3xl rounded-full" />
                <p className="text-[10px] font-bold text-plano-300 uppercase tracking-widest mb-2 relative z-10">Projected MRR</p>
                <h3 className="text-4xl font-bold mb-4 relative z-10 tabular-nums">₹{mrr.toLocaleString()}</h3>
                <div className="flex items-center justify-between relative z-10 pt-4 border-t border-white/10">
                   <div className="flex items-center gap-2 text-[9px] font-bold text-plano-400 uppercase tracking-widest">
                      <TrendingUp size={12} />
                      Trend Analysis
                   </div>
                   <span className="text-[10px] font-bold text-success-400 uppercase tracking-widest">+₹{Math.round(mrr * 0.08).toLocaleString()} Forecast</span>
                </div>
             </div>

             {/* Recent Activity List */}
             <div className="bg-white rounded-[2rem] border border-plano-50 p-6 flex-1 min-h-0 flex flex-col overflow-hidden shadow-sm">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                   <h4 className="text-[11px] font-bold text-plano-900 uppercase tracking-widest flex items-center gap-2">
                      <Activity size={14} className="text-plano-600" />
                      Recent Activity
                   </h4>
                   <Link href="/portal/account/orders" className="text-[9px] font-bold text-gray-400 hover:text-plano-600 uppercase transition-all">View All</Link>
                </div>
                
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                   {payments.slice(0, 5).map((p, i) => (
                     <div key={p.id} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-plano-50 flex items-center justify-center text-plano-600 flex-shrink-0 group-hover:bg-plano-600 group-hover:text-white transition-all">
                           <IndianRupee size={16} />
                        </div>
                        <div className="flex-grow min-w-0">
                           <h5 className="text-[10px] font-bold text-plano-900 uppercase truncate">Payment Settled</h5>
                           <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">{new Date(p.paymentDate).toLocaleDateString()}</p>
                        </div>
                        <span className="text-[11px] font-bold text-plano-900">₹{p.amount.toLocaleString()}</span>
                     </div>
                   ))}
                   {payments.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 opacity-50 py-10">
                        <Activity size={24} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">No recent records</span>
                     </div>
                   )}
                </div>
             </div>

          </div>

        </div>

      </div>
    </div>
  );
}
