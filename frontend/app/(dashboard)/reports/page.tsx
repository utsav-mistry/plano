'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
   BarChart3,
   Calendar,
   Download,
   Filter,
   Search,
   ArrowUpRight,
   TrendingUp,
   AlertCircle,
   FileText,
   PieChart as PieChartIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { toAdminPath } from '@/lib/path-scoping';
import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   BarChart,
   Bar,
   PieChart,
   Pie,
   Cell,
   Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type RevenuePoint = { name: string; revenue: number };
type SubscriptionPoint = { name: string; value: number };
type PaymentUser = { name?: string };
type PaymentRow = {
   _id?: string;
   paymentDate?: string;
   userId?: string | PaymentUser;
   paymentMethod?: string;
   method?: string;
   amount?: number;
   currency?: string;
   status?: string;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
   typeof value === 'object' && value !== null;

const toNumber = (value: unknown) => {
   if (typeof value === 'number') return value;
   const parsed = Number(value);
   return Number.isFinite(parsed) ? parsed : 0;
};

export default function ReportsPage() {
   const pathname = usePathname();
   const [period, setPeriod] = useState('30d');
   const [auditSearch, setAuditSearch] = useState('');
   const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
   const [subscriptionData, setSubscriptionData] = useState<SubscriptionPoint[]>([]);
   const [transactions, setTransactions] = useState<PaymentRow[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const fetchReports = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try {
         const [revRes, subRes, payRes] = await Promise.all([
            api.reports.getRevenueReport({ period }),
            api.reports.getSubscriptionReport({ period }),
            api.payments.getAll({ limit: 10 })
         ]);

         if (revRes.success) {
            const rawRevenue = revRes.data as unknown;
            let revenueRows: unknown[] = [];

            if (Array.isArray(rawRevenue)) {
               revenueRows = rawRevenue;
            } else if (isObjectRecord(rawRevenue) && Array.isArray(rawRevenue.revenue)) {
               revenueRows = rawRevenue.revenue;
            }

            setRevenueData(
               revenueRows.map((row): RevenuePoint => {
                  if (!isObjectRecord(row)) {
                     return { name: '-', revenue: 0 };
                  }

                  const rawName = row.name ?? row._id;
                  return {
                     name: typeof rawName === 'string' ? rawName : '-',
                     revenue: toNumber(row.revenue ?? row.totalRevenue),
                  };
               })
            );
         }

         if (subRes.success) {
            const rawSubscription = subRes.data as unknown;
            let subscriptionRows: unknown[] = [];

            if (Array.isArray(rawSubscription)) {
               subscriptionRows = rawSubscription;
            } else if (isObjectRecord(rawSubscription) && Array.isArray(rawSubscription.statusBreakdown)) {
               subscriptionRows = rawSubscription.statusBreakdown;
            }

            setSubscriptionData(
               subscriptionRows.map((row): SubscriptionPoint => {
                  if (!isObjectRecord(row)) {
                     return { name: 'unknown', value: 0 };
                  }

                  const rawName = row.name ?? row._id;
                  return {
                     name: typeof rawName === 'string' ? rawName : 'unknown',
                     value: toNumber(row.value ?? row.count),
                  };
               })
            );
         }

         if (payRes.success) {
            const paymentPayload = payRes.data as unknown;
            let paymentRows: unknown[] = [];

            if (Array.isArray(paymentPayload)) {
               paymentRows = paymentPayload;
            } else if (isObjectRecord(paymentPayload) && Array.isArray(paymentPayload.payments)) {
               paymentRows = paymentPayload.payments;
            }

            setTransactions(
               paymentRows
                  .filter(isObjectRecord)
                  .map((row) => ({
                     _id: typeof row._id === 'string' ? row._id : undefined,
                     paymentDate: typeof row.paymentDate === 'string' ? row.paymentDate : undefined,
                     userId: typeof row.userId === 'string' || isObjectRecord(row.userId)
                        ? (row.userId as string | PaymentUser)
                        : undefined,
                     paymentMethod: typeof row.paymentMethod === 'string' ? row.paymentMethod : undefined,
                     method: typeof row.method === 'string' ? row.method : undefined,
                     amount: toNumber(row.amount),
                     currency: typeof row.currency === 'string' ? row.currency : undefined,
                     status: typeof row.status === 'string' ? row.status : undefined,
                  }))
            );
         }
      } catch (err: unknown) {
         setError(err instanceof Error ? err.message : 'Failed to load financial reports');
      } finally {
         setIsLoading(false);
      }
   }, [period]);

   useEffect(() => {
      fetchReports();
   }, [fetchReports]);

   const periods = [
      { label: 'Last 30 Days', value: '30d' },
      { label: 'Last 90 Days', value: '90d' },
      { label: 'Year to Date', value: 'ytd' },
      { label: 'All Time', value: 'all' },
   ];

   const totalRevenue = revenueData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
   const totalGrowth = revenueData.length > 1
      ? ((revenueData[revenueData.length - 1].revenue - revenueData[0].revenue) / (revenueData[0].revenue || 1) * 100).toFixed(1)
      : '0';

   const filteredTransactions = transactions.filter((row) => {
      const q = auditSearch.toLowerCase().trim();
      if (!q) return true;

      const customerName = typeof row.userId === 'object' ? (row.userId?.name || '') : 'customer';
      return (
         String(row._id || '').toLowerCase().includes(q) ||
         customerName.toLowerCase().includes(q) ||
         String(row.paymentMethod || row.method || '').toLowerCase().includes(q) ||
         String(row.status || '').toLowerCase().includes(q)
      );
   });

   function exportReportCsv() {
      const header = ['payment_id', 'date', 'customer', 'method', 'amount_inr', 'status'];
      const rows = filteredTransactions.map((row) => [
         row._id || '',
         row.paymentDate ? new Date(row.paymentDate).toISOString().slice(0, 10) : '',
         typeof row.userId === 'object' ? (row.userId?.name || 'Customer') : 'Customer',
         (row.paymentMethod || row.method || 'unknown').replace('_', ' '),
         String(row.amount || 0),
         row.status || 'unknown',
      ]);

      const csv = [header, ...rows]
         .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
         .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
   }

   return (
      <div className="flex flex-col lg:flex-row gap-8 pb-12">
         {/* Left Sidebar: Filters */}
         <aside className="w-full lg:w-64 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
            <div className="bg-bg-surface p-6 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-6">
               <div className="flex items-center gap-2 pb-4 border-b border-border dark:border-sidebar-hover">
                  <Filter size={18} className="text-plano-600" />
                  <h3 className="text-[11px] uppercase font-bold text-text-primary tracking-widest">Report Filters</h3>
               </div>

               <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Select Period</span>
                  <div className="flex flex-col gap-1">
                     {periods.map((p) => (
                        <button
                           key={p.value}
                           onClick={() => setPeriod(p.value)}
                           className={cn(
                              "w-full text-left px-3 py-2.5 rounded text-xs font-bold transition-all",
                              period === p.value ? "bg-plano-600 dark:bg-plano-500 text-white shadow-md" : "text-gray-500 hover:bg-bg-page hover:text-plano-600 dark:hover:text-plano-400"
                           )}
                        >
                           {p.label}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border dark:border-sidebar-hover">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1.5">
                     <Calendar size={12} /> Custom Range
                  </span>
                  <div className="flex flex-col gap-3">
                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter ml-1">From</span>
                        <input type="date" className="w-full h-9 px-3 rounded border border-border dark:border-sidebar-hover bg-gray-50 dark:bg-bg-page text-text-primary text-[10px] font-bold font-mono focus:outline-none focus:border-plano-500" />
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter ml-1">To</span>
                        <input type="date" className="w-full h-9 px-3 rounded border border-border dark:border-sidebar-hover bg-gray-50 dark:bg-bg-page text-text-primary text-[10px] font-bold font-mono focus:outline-none focus:border-plano-500" />
                     </div>
                  </div>
               </div>

               <button className="mt-4 w-full h-11 bg-plano-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-plano-700 transition-all shadow-lg">
                  Refresh Analysis
               </button>
            </div>
         </aside>

         {/* Main Content Area */}
         <main className="flex-1 flex flex-col gap-8">
            {/* Reports Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div className="flex flex-col gap-2">
                  <h1 className="text-4xl text-text-primary">Financial Reports</h1>
                  <div className="flex items-center gap-2">
                     <span className="px-2.5 py-1 rounded bg-plano-50 text-plano-700 text-[10px] font-bold uppercase tracking-widest border border-plano-100">
                        {periods.find(p => p.value === period)?.label}
                     </span>
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Live data connection established</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={exportReportCsv} className="flex items-center gap-2 px-6 h-11 bg-bg-surface border border-border dark:border-sidebar-hover rounded-xl text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-sidebar-hover hover:border-plano-200 transition-all shadow-sm">
                     <Download size={16} />
                     Export CSV
                  </button>
               </div>
            </div>

            {isLoading ? (
               <div className="flex-1 min-h-[600px] flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-plano-600 animate-spin" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Analyzing Transactional Data...</p>
               </div>
            ) : error ? (
               <div className="flex-1 min-h-[600px] flex flex-col items-center justify-center gap-4 text-center px-6">
                  <AlertCircle size={48} className="text-danger-500" />
                  <h3 className="text-xl font-serif font-bold text-text-primary">Audit Interrupted</h3>
                  <p className="text-sm text-text-secondary max-w-md">{error}</p>
                  <button onClick={fetchReports} className="px-6 py-2 bg-plano-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-plano-700">Attempt Recovery</button>
               </div>
            ) : (
               <>
                  {/* Mini KPIs Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                        { label: 'Total Gross', value: formatCurrency(totalRevenue), color: 'text-text-primary' },
                        { label: 'Analysis Period', value: periods.find(p => p.value === period)?.label, color: 'text-plano-600' },
                        { label: 'Avg Growth', value: `${totalGrowth}%`, color: Number(totalGrowth) >= 0 ? 'text-success-600' : 'text-danger-600' },
                        { label: 'Data Points', value: revenueData.length.toString(), color: 'text-text-secondary' },
                     ].map((kpi, idx) => (
                        <div key={idx} className="bg-bg-surface p-5 rounded-card border border-border shadow-sm flex flex-col gap-1.5 hover:shadow-md transition-all border-b-4 border-b-transparent hover:border-b-plano-500">
                           <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.1em]">{kpi.label}</span>
                           <span className={cn("text-xl font-serif font-bold", kpi.color)}>{kpi.value}</span>
                        </div>
                     ))}
                  </div>

                  {/* Main Chart: Revenue Distribution */}
                  <div className="bg-bg-surface p-8 rounded-card border border-border shadow-sm">
                     <div className="flex items-center justify-between mb-10">
                        <div className="flex flex-col gap-1">
                           <h3 className="text-2xl font-serif font-bold text-text-primary flex items-center gap-2">
                              <TrendingUp size={20} className="text-success-500" /> Revenue Inflow
                           </h3>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gross revenue generated across the selected timeline</p>
                        </div>
                        <div className="px-4 py-2 bg-success-50 dark:bg-success-900/20 border border-success-100 dark:border-success-800 rounded-lg flex items-center gap-2 text-xs font-bold text-success-700 dark:text-success-400">
                           {totalGrowth}% <ArrowUpRight size={14} />
                        </div>
                     </div>
                     <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                 <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={15} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dx={-15} tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                              <Tooltip
                                 contentStyle={{
                                    borderRadius: '16px',
                                    border: '1px solid rgba(148,163,184,0.2)',
                                    background: 'var(--color-bg-surface, #1e1828)',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                                    padding: '12px 16px',
                                    fontWeight: '700',
                                    color: '#e2e8f0'
                                 }}
                                 itemStyle={{ color: '#818cf8' }}
                              />
                              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#revenueGradient)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Bottom Grid: Breakdown Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Subscription Segments */}
                     <div className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-8">
                           <PieChartIcon size={20} className="text-plano-600" />
                           <h3 className="text-xl font-serif font-bold text-text-primary">Subscription Breakdown</h3>
                        </div>
                        <div className="h-72 w-full relative">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                    data={subscriptionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={6}
                                    dataKey="value"
                                 >
                                    {subscriptionData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                 </Pie>
                                 <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                                 <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, paddingTop: '30px' }} />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     {/* Revenue by Plan */}
                     <div className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-8">
                           <BarChart3 size={20} className="text-plano-600" />
                           <h3 className="text-xl font-serif font-bold text-text-primary">Plan Performance</h3>
                        </div>
                        <div className="h-72 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={subscriptionData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                 <XAxis type="number" hide />
                                 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '700', fill: '#1e293b' }} width={90} />
                                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px' }} />
                                 <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={24} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </div>

                  {/* Detailed Transactions Table */}
                  <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm mt-4">
                     <div className="p-6 border-b border-border dark:border-sidebar-hover flex items-center justify-between bg-gray-50/10 dark:bg-white/5">
                        <div className="flex flex-col gap-1">
                           <h3 className="text-[11px] uppercase font-bold text-gray-500 tracking-widest">Transaction Audit Log</h3>
                           <span className="text-[9px] text-gray-400 font-bold uppercase">Latest payments and reconciliations</span>
                        </div>
                        <div className="relative">
                           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                           <input value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} type="text" placeholder="Audit lookup..." className="h-9 pl-9 pr-4 rounded-lg border border-border dark:border-sidebar-hover bg-white dark:bg-bg-page text-text-primary text-[10px] font-bold focus:outline-none focus:border-plano-500 dark:focus:bg-white/10 transition-all w-48" />
                        </div>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-bg-page dark:bg-white/10 border-b border-border dark:border-sidebar-hover">
                                 <th className="py-4 px-8 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Date</th>
                                 <th className="py-4 px-8 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Customer Profile</th>
                                 <th className="py-4 px-8 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Method</th>
                                 <th className="py-4 px-8 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-right whitespace-nowrap">Gross Amount</th>
                                 <th className="py-4 px-8 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-center">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-border dark:divide-sidebar-hover">
                              {filteredTransactions.length === 0 ? (
                                 <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                       <div className="flex flex-col items-center gap-3">
                                          <FileText size={32} className="text-gray-200" />
                                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No recent transactions recorded</p>
                                       </div>
                                    </td>
                                 </tr>
                              ) : (
                                 filteredTransactions.map((row) => (
                                    <tr key={row._id} className="group hover:bg-gray-25 dark:hover:bg-white/10 transition-colors">
                                       <td className="py-5 px-8 text-xs text-text-secondary font-mono font-bold">
                                          {row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : '-'}
                                       </td>
                                       <td className="py-5 px-8">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-plano-50 dark:bg-white/10 text-plano-600 dark:text-plano-400 flex items-center justify-center text-[10px] font-bold border border-plano-100 dark:border-white/5">
                                                {typeof row.userId === 'object' ? row.userId?.name?.charAt(0) : 'U'}
                                             </div>
                                             <span className="text-sm font-semibold text-text-primary group-hover:text-plano-600 dark:group-hover:text-plano-400 transition-colors">
                                                {typeof row.userId === 'object' ? row.userId?.name : 'Customer'}
                                             </span>
                                          </div>
                                       </td>
                                       <td className="py-5 px-8">
                                          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest bg-gray-50 dark:bg-white/10 px-2 py-0.5 rounded border border-gray-100 dark:border-white/5">
                                             {(row.paymentMethod || row.method || 'unknown').replace('_', ' ')}
                                          </span>
                                       </td>
                                       <td className="py-5 px-8 text-right text-sm font-bold font-mono text-text-primary">
                                          {formatCurrency(row.amount || 0, row.currency || 'INR')}
                                       </td>
                                       <td className="py-5 px-8 text-center uppercase">
                                          <span className={cn(
                                             "text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full border shadow-sm",
                                             row.status === 'completed' ? "bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400 border-success-200 dark:border-success-800" :
                                                row.status === 'failed' ? "bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400 border-danger-200 dark:border-danger-800" :
                                                   "bg-gray-100 dark:bg-white/10 text-gray-500 border-gray-200 dark:border-white/10"
                                          )}>
                                             {row.status || 'unknown'}
                                          </span>
                                       </td>
                                    </tr>
                                 ))
                              )}
                           </tbody>
                        </table>
                     </div>
                     <div className="p-6 bg-bg-page dark:bg-white/5 flex justify-center border-t border-border dark:border-sidebar-hover">
                        <Link href={toAdminPath(pathname, '/payments')} className="text-[10px] font-bold text-plano-600 uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
                           Analyze full activity ledger <ArrowUpRight size={14} />
                        </Link>
                     </div>
                  </div>
               </>
            )}
         </main>
      </div>
   );
}
