'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  ArrowUpRight,
  Calendar,
  Download,
  AlertCircle,
  FileCheck,
  Loader2
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Subscription } from '@/types';
import { api } from '@/lib/api';
import { toAdminPath } from '@/lib/path-scoping';

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

export default function SubscriptionsPage() {
  const pathname = usePathname();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  async function fetchSubscriptions() {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'TRIAL'].includes(activeTab)) {
        params.status = activeTab.toLowerCase();
      }
      if (activeTab === 'RECURRING') {
        params.autoRenew = 'true';
      }
      if (activeTab === 'NORMAL') {
        params.autoRenew = 'false';
      }

      const response = await api.subscriptions.getAll(params);
      if (response.success) {
        const data = response.data as any;
        setSubscriptions(data?.subscriptions ?? data ?? []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, [activeTab]);

  const tabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Recurring', value: 'RECURRING' },
    { label: 'Normal', value: 'NORMAL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Paused', value: 'PAUSED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Expired', value: 'EXPIRED' },
  ];

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.reports.getSubscriptionReport();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch subscription stats', err);
      }
    }
    fetchStats();
  }, []);

  const statsCards = [
    { label: 'Active Subs', count: stats?.activeSubscriptions || 0, trend: '+0%', color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Expiring this month', count: stats?.expiringThisMonth || 0, trend: '0%', color: 'text-warning-600', bg: 'bg-warning-50' },
    { label: 'Overdue Revenue', count: stats ? formatCurrency(stats.overdueRevenue, 'INR') : '₹0', trend: '0%', color: 'text-danger-600', bg: 'bg-danger-50' },
  ];

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    const customerName = typeof sub.userId !== 'string' ? (sub.userId?.name || '') : 'customer';
    const planName = typeof sub.planId !== 'string' ? (sub.planId?.name || '') : 'plan';

    return (
      String(sub.id || '').toLowerCase().includes(q) ||
      customerName.toLowerCase().includes(q) ||
      planName.toLowerCase().includes(q) ||
      String(sub.status || '').toLowerCase().includes(q)
    );
  });

  function exportSubscriptionsCsv() {
    const header = ['subscription_id', 'customer', 'status', 'plan', 'start_date', 'grand_total_inr'];
    const rows = filteredSubscriptions.map((sub) => {
      const customerName = typeof sub.userId !== 'string' ? (sub.userId?.name || 'Customer') : 'Customer';
      const planName = typeof sub.planId !== 'string' ? (sub.planId?.name || 'Plan') : 'Plan';
      return [
        sub.id,
        customerName,
        sub.status,
        planName,
        sub.startDate,
        String(sub.grandTotal || 0),
      ];
    });

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Subscriptions</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
            Manage and track customer subscription lifecycles.
          </p>
        </div>
        <Link
          href={toAdminPath(pathname, '/subscriptions/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          New Subscription
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-bg-surface p-4 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{stat.label}</span>
              <span className="text-2xl font-serif font-bold text-text-primary">
                {typeof stat.count === 'string' ? stat.count : stat.count.toLocaleString()}
              </span>
            </div>
            <div className={cn(
              "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
              stat.bg === "bg-success-50" ? "bg-success-50 dark:bg-success-900/20" :
                stat.bg === "bg-warning-50" ? "bg-warning-50 dark:bg-warning-900/20" :
                  stat.bg === "bg-danger-50" ? "bg-danger-50 dark:bg-danger-900/20" : stat.bg,
              stat.color
            )}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 bg-bg-surface p-5 rounded-card border border-border dark:border-sidebar-hover shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, sub #, or invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-input border border-border dark:border-sidebar-hover bg-gray-25 dark:bg-bg-page focus:border-plano-500 dark:focus:bg-white/10 focus:outline-none transition-all text-sm font-sans text-text-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportSubscriptionsCsv}
              className="flex items-center gap-2 px-4 h-10 border border-border dark:border-sidebar-hover bg-bg-surface rounded-input text-xs font-bold uppercase tracking-widest text-text-secondary hover:bg-sidebar-hover transition-colors"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200",
                activeTab === tab.value
                  ? "bg-plano-600 dark:bg-plano-500 text-white shadow-lg shadow-plano-600/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-400"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table Area */}
      <div className="bg-bg-surface rounded-card border border-border dark:border-sidebar-hover overflow-hidden shadow-sm min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="w-8 h-8 text-plano-600 animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading subscriptions...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center text-danger-500">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-bold text-text-primary uppercase tracking-tight">{error}</p>
            <button
              onClick={fetchSubscriptions}
              className="text-xs font-bold text-plano-600 underline uppercase tracking-widest"
            >
              Try again
            </button>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300">
              <FileText size={32} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-lg font-serif font-bold text-text-primary uppercase tracking-tight">No subscriptions found</p>
              <p className="text-xs text-text-secondary font-medium italic uppercase tracking-wider">Try adjusting your filters or create a new subscription.</p>
            </div>
            <Link
              href={toAdminPath(pathname, '/subscriptions/new')}
              className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
            >
              <Plus size={16} /> New Subscription
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border dark:border-sidebar-hover bg-gray-50/50 dark:bg-white/10">
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Sub Number</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Customer</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Status</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Type</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Plan Name</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Grand Total</th>
                    <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-sidebar-hover">
                  {filteredSubscriptions.map((sub: Subscription) => (
                    <tr key={sub.id} className="group hover:bg-gray-25 dark:hover:bg-white/10 transition-colors border-border dark:border-sidebar-hover">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-text-primary tracking-tighter">{sub.id}</span>
                          <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                            <Calendar size={10} />
                            {sub.startDate}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-plano-50 dark:bg-white/10 text-plano-600 dark:text-plano-400 flex items-center justify-center text-[10px] font-bold border border-plano-100 dark:border-white/5 uppercase">
                            {typeof sub.userId !== 'string' ? (sub.userId?.name?.charAt(0) || 'U') : 'U'}
                          </div>
                          <span className="text-sm font-semibold text-text-primary">
                            {typeof sub.userId !== 'string' ? sub.userId?.name : 'Customer'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-tighter px-2.5 py-1 rounded-full border",
                          sub.status === 'active' ? "bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-500 border-success-200 dark:border-success-800" :
                            sub.status === 'paused' ? "bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-500 border-warning-200 dark:border-warning-800" :
                              sub.status === 'expired' ? "bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-500 border-danger-200 dark:border-danger-800" :
                                "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10"
                        )}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          'text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border',
                          sub.autoRenew
                            ? 'bg-plano-50 text-plano-600 border-plano-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        )}>
                          {sub.autoRenew ? 'Recurring' : 'Normal'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-text-secondary flex items-center gap-2">
                            <FileCheck size={14} className="text-plano-500" />
                            {typeof sub.planId !== 'string' ? sub.planId?.name : 'Plan'}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 rounded-full bg-plano-50 text-plano-600 border border-plano-100 text-[10px] font-bold uppercase tracking-widest">
                              {getCycleLabel(sub)} cycle
                            </span>
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                              {sub.autoRenew ? 'Auto-renew enabled' : 'Auto-renew off'}
                            </span>
                          </div>
                          <div className="w-full max-w-[180px]">
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
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-text-primary">{formatCurrency(sub.grandTotal || 0, 'INR')}</span>
                          <span className="text-[9px] uppercase font-bold text-gray-400">incl. tax</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={toAdminPath(pathname, `/subscriptions/${sub.id}`)}
                            className="p-1.5 rounded-btn hover:bg-plano-50 dark:hover:bg-white/10 text-gray-400 hover:text-plano-600 dark:hover:text-plano-400 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ArrowUpRight size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-white/5 border-t border-border dark:border-sidebar-hover flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Showing {filteredSubscriptions.length} subscriptions</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
