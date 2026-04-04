'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  ChevronDown, 
  Download, 
  FileCheck, 
  Filter, 
  Search, 
  ArrowUpRight,
  Monitor,
  Smartphone,
  CreditCard,
  Banknote,
  SmartphoneIcon
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
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

const revenueData = [
  { name: 'Apr 01', revenue: 45000 },
  { name: 'Apr 05', revenue: 52000 },
  { name: 'Apr 10', revenue: 48000 },
  { name: 'Apr 15', revenue: 61000 },
  { name: 'Apr 20', revenue: 55000 },
  { name: 'Apr 25', revenue: 67000 },
  { name: 'Apr 30', revenue: 82500 },
];

const plansData = [
  { name: 'Monthly Pro', total: 245000 },
  { name: 'Annual Elite', total: 180000 },
  { name: 'Monthly Starter', total: 65000 },
  { name: 'Yearly Basic', total: 45000 },
];

const paymentMethods = [
  { name: 'Bank Transfer', value: 245000, color: '#3b82f6' },
  { name: 'UPI', value: 120000, color: '#22c55e' },
  { name: 'Card', value: 85000, color: '#f59e0b' },
  { name: 'Cash', value: 32500, color: '#ef4444' },
];

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('This Month');

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      {/* Left Sidebar: Filters */}
      <aside className="w-full lg:w-64 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
         <div className="bg-bg-surface p-6 rounded-card border border-border shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
               <Filter size={18} className="text-plano-600" />
               <h3 className="text-[11px] uppercase font-bold text-text-primary tracking-widest">Report Filters</h3>
            </div>

            <div className="flex flex-col gap-2">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Select Period</span>
               <div className="flex flex-col gap-1">
                  {['This Month', 'Last 30 Days', 'This Quarter', 'This Year'].map((p) => (
                    <button 
                      key={p} 
                      onClick={() => setPeriod(p)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded text-xs font-bold transition-all",
                        period === p ? "bg-plano-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {p}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex flex-col gap-2">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">From</span>
               <input type="date" defaultValue="2025-04-01" className="w-full h-9 px-3 rounded border border-border bg-gray-50 text-xs font-bold" />
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-2">To</span>
               <input type="date" defaultValue="2025-04-30" className="w-full h-9 px-3 rounded border border-border bg-gray-50 text-xs font-bold" />
            </div>

            <div className="flex flex-col gap-2">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Subscription Plan</span>
               <select className="w-full h-10 px-3 rounded border border-border bg-gray-50 text-xs font-bold focus:outline-none">
                  <option>All Plans</option>
                  <option>Monthly Pro</option>
                  <option>Annual Elite</option>
               </select>
            </div>

            <button className="mt-4 w-full h-11 bg-plano-900 text-white rounded-btn text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md">
               Apply Filters
            </button>
            <button className="w-full text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-text-primary transition-all">
               Clear All
            </button>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-8">
         {/* Reports Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
               <h1 className="text-4xl text-text-primary uppercase tracking-tight">Financial Reports</h1>
               <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-plano-50 text-plano-700 text-[10px] font-bold uppercase tracking-widest">{period}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Updated 5m ago</span>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button className="flex items-center gap-2 px-4 h-10 bg-white border border-border rounded-btn text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-50 transition-all shadow-sm">
                  <Download size={16} />
                  Export PDF
               </button>
               <button className="px-4 h-10 bg-white border border-border rounded-btn text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-50 transition-all shadow-sm">
                  XLS
               </button>
            </div>
         </div>

         {/* Mini KPIs Row */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: '₹4,82,500', color: 'text-text-primary' },
              { label: 'Paid Invoices', value: '76', color: 'text-success-600' },
              { label: 'Payments Recv', value: '₹4,32,000', color: 'text-info-600' },
              { label: 'Overdue Amt', value: '₹50,500', color: 'text-danger-600' },
            ].map((kpi, idx) => (
              <div key={idx} className="bg-bg-surface p-4 rounded-card border border-border shadow-sm flex flex-col gap-1 hover:shadow-md transition-all">
                 <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">{kpi.label}</span>
                 <span className={cn("text-xl font-serif font-bold", kpi.color)}>{kpi.value}</span>
              </div>
            ))}
         </div>

         {/* Main Chart: Revenue over Time */}
         <div className="bg-bg-surface p-6 rounded-card border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-serif font-bold text-text-primary">Revenue Distribution</h3>
               <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded border border-border text-[10px] font-bold text-gray-500 uppercase">
                  Daily Growth <ArrowUpRight size={12} className="text-success-500" />
               </div>
            </div>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#857f78' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#857f78' }} dx={-10} tickFormatter={(v) => `₹${v/1000}k`} />
                     <Tooltip 
                        contentStyle={{ 
                           borderRadius: '12px', 
                           border: '1px solid #e4e0db', 
                           boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                           fontSize: '12px',
                           fontWeight: '700'
                        }} 
                        itemStyle={{ color: '#2563eb' }}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Bottom Grid: Breakdown Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Plans by Revenue */}
            <div className="bg-bg-surface p-6 rounded-card border border-border shadow-sm flex flex-col">
               <h3 className="text-xl font-serif font-bold text-text-primary mb-6">Top Plans by Gross</h3>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart layout="vertical" data={plansData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '700', fill: '#1a1714' }} width={80} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                        <Bar dataKey="total" fill="#3b8276" radius={[0, 4, 4, 0]} barSize={20} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-bg-surface p-6 rounded-card border border-border shadow-sm flex flex-col">
               <h3 className="text-xl font-serif font-bold text-text-primary mb-4">Payment Channels</h3>
               <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={paymentMethods}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={4}
                           dataKey="value"
                        >
                           {paymentMethods.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                           ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, paddingTop: '20px' }} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Detailed Transactions Table */}
         <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm mt-2">
            <div className="p-6 border-b border-border flex items-center justify-between">
               <h3 className="text-xl font-serif font-bold text-text-primary">Transaction Audit</h3>
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search audit log..." className="h-8 pl-9 pr-4 rounded border border-border bg-gray-50 text-[10px] focus:outline-none" />
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50/50 border-b border-border">
                        <th className="py-3 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Date</th>
                        <th className="py-3 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Customer</th>
                        <th className="py-3 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Invoice</th>
                        <th className="py-3 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Amount</th>
                        <th className="py-3 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {[
                        { date: 'Apr 30, 2025', customer: 'Acme Corp', invoice: 'INV-00089', amount: 12450, status: 'SUCCESS' },
                        { date: 'Apr 28, 2025', customer: 'StartupX', invoice: 'INV-00087', amount: 8500, status: 'SUCCESS' },
                        { date: 'Apr 26, 2025', customer: 'Global Labs', invoice: 'INV-00086', amount: 15000, status: 'PENDING' },
                        { date: 'Apr 25, 2025', customer: 'Infinity Soft', invoice: 'INV-00084', amount: 4500, status: 'FAILED' },
                     ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-25 transition-colors">
                           <td className="py-4 px-6 text-xs text-text-secondary font-medium">{row.date}</td>
                           <td className="py-4 px-6 text-sm font-semibold text-text-primary">{row.customer}</td>
                           <td className="py-4 px-6 text-xs font-mono font-bold text-plano-600">{row.invoice}</td>
                           <td className="py-4 px-6 text-right text-sm font-bold font-mono">{formatCurrency(row.amount, 'INR')}</td>
                           <td className="py-4 px-6 text-center">
                              <span className={cn(
                                 "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                 row.status === 'SUCCESS' ? "bg-success-50 text-success-700 border-success-200" :
                                 row.status === 'PENDING' ? "bg-warning-50 text-warning-700 border-warning-200" :
                                 "bg-danger-50 text-danger-700 border-danger-200"
                              )}>
                                 {row.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="p-4 bg-gray-50/30 flex justify-center">
               <button className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:text-plano-600 transition-all">View All Activity Log</button>
            </div>
         </div>
      </main>
    </div>
  );
}
