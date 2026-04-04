'use client';

import React from 'react';
import {
  Users,
  TrendingUp,
  AlertCircle,
  UserPlus,
  Plus,
  ArrowRight,
  Loader2
} from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import StatusDonut from '@/components/dashboard/StatusDonut';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/lib/api';
import { KPIStats } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const pathname = usePathname();
  const routePrefix = pathname.startsWith('/admin') ? '/admin' : '';
  const [stats, setStats] = React.useState<KPIStats | null>(null);
  const [recentSubs, setRecentSubs] = React.useState<any[]>([]);
  const [renewals, setRenewals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [subsLoading, setSubsLoading] = React.useState(true);

  // KPI stats
  React.useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.reports.getDashboardStats();
        if (response.success) setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Recent subscriptions + upcoming renewals
  React.useEffect(() => {
    async function fetchSubs() {
      try {
        const [recentRes, activeRes] = await Promise.all([
          api.subscriptions.getAll({ limit: 5 }),
          api.subscriptions.getAll({ status: 'active', limit: 20 }),
        ]);
        if (recentRes.success) {
          const d = recentRes.data as any;
          setRecentSubs(d.subscriptions ?? d ?? []);
        }
        if (activeRes.success) {
          const d = activeRes.data as any;
          const active: any[] = d.subscriptions ?? d ?? [];
          // Sort by endDate ascending and pick the 5 soonest
          const sorted = active
            .filter(s => s.endDate)
            .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
            .slice(0, 5);
          setRenewals(sorted);
        }
      } catch {
        // Silently fail — non-critical
      } finally {
        setSubsLoading(false);
      }
    }
    fetchSubs();
  }, []);

  const kpis = [
    {
      label: 'Active Subscriptions',
      value: stats?.activeSubscriptions.toString() || '0',
      trend: stats?.activeSubscriptionsTrend || 0,
      icon: <Users size={20} />,
      iconColorClass: 'bg-plano-50 text-plano-600',
    },
    {
      label: 'Monthly Recurring Revenue',
      value: stats ? `₹${stats.mrr.toLocaleString('en-IN')}` : '₹0',
      trend: stats?.mrrTrend || 0,
      icon: <TrendingUp size={20} />,
      iconColorClass: 'bg-success-50 text-success-500',
    },
    {
      label: 'Overdue Invoices',
      value: stats?.overdueInvoices.toString() || '0',
      trend: stats?.overdueInvoicesTrend || 0,
      icon: <AlertCircle size={20} />,
      iconColorClass: 'bg-danger-50 text-danger-500',
    },
    {
      label: 'New Subscriptions (30d)',
      value: stats?.newSubscriptions30d.toString() || '0',
      trend: stats?.newSubscriptions30dTrend || 0,
      icon: <UserPlus size={20} />,
      iconColorClass: 'bg-warning-50 text-warning-500',
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header section */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl">Good morning, {user?.name.split(' ')[0] || 'User'}</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
            Here's what's happening with Plano today.
          </p>
        </div>
        <Link
          href={`${routePrefix}/subscriptions/new`}
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-semibold shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          New Subscription
        </Link>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <StatusDonut />
        </div>
      </div>

      {/* Bottom Grid: Recent Subscriptions and Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions Table (Mini) */}
        <div className="bg-bg-surface p-6 rounded-card border border-border mt-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif font-bold text-text-primary">Recent Subscriptions</h3>
            <Link href={`${routePrefix}/subscriptions`} className="text-xs font-semibold text-plano-600 hover:underline flex items-center gap-1 uppercase tracking-widest">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-2 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Sub #</th>
                  <th className="py-3 px-2 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Customer</th>
                  <th className="py-3 px-2 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Plan</th>
                  <th className="py-3 px-2 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Amount</th>
                  <th className="py-3 px-2 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 text-plano-600 animate-spin" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fetching records...</span>
                      </div>
                    </td>
                  </tr>
                ) : recentSubs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  recentSubs.map((sub: any) => (
                    <tr key={sub._id} className="group hover:bg-gray-25 transition-colors cursor-pointer" onClick={() => window.location.href = `${routePrefix}/subscriptions/${sub._id}`}>
                      <td className="py-4 px-2 font-mono text-[10px] text-text-secondary">SUB-{sub._id.slice(-5).toUpperCase()}</td>
                      <td className="py-4 px-2 text-sm font-medium">
                        {typeof sub.userId === 'object' ? sub.userId?.name : 'Customer'}
                      </td>
                      <td className="py-4 px-2 text-xs text-text-secondary font-medium">
                        {typeof sub.planId === 'object' ? sub.planId?.name : 'Plan'}
                      </td>
                      <td className="py-4 px-2 font-mono text-xs font-semibold">
                        ₹{(typeof sub.planId === 'object' ? sub.planId?.price : 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-2">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter",
                          sub.status === 'active' ? "bg-success-50 text-success-700" :
                            sub.status === 'paused' ? "bg-warning-50 text-warning-700" :
                              "bg-info-50 text-info-700"
                        )}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-bg-surface p-6 rounded-card border border-border mt-2">
          <h3 className="text-xl font-serif font-bold text-text-primary mb-6">Upcoming Renewals</h3>
          <div className="flex flex-col gap-4">
            {subsLoading ? (
              <div className="flex items-center justify-center py-10 gap-2">
                <Loader2 className="w-5 h-5 text-plano-600 animate-spin" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Checking dates...</span>
              </div>
            ) : renewals.length === 0 ? (
              <div className="py-10 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                No near renewals
              </div>
            ) : (
              renewals.map((item: any) => {
                const daysLeft = Math.ceil((new Date(item.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const urgency = daysLeft <= 3 ? 'high' : daysLeft <= 7 ? 'medium' : 'low';

                return (
                  <div key={item._id} className={cn(
                    "flex items-center justify-between p-3 rounded-lg border-l-4 transition-all hover:bg-gray-50 cursor-pointer",
                    urgency === 'high' ? "border-danger-500 bg-danger-50/10" : urgency === 'medium' ? "border-warning-500 bg-warning-50/10" : "border-border bg-gray-50/20"
                  )} onClick={() => window.location.href = `${routePrefix}/subscriptions/${item._id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-plano-100 flex items-center justify-center text-xs font-bold text-plano-600 border border-plano-200">
                        {typeof item.userId === 'object' ? item.userId?.name?.charAt(0) : 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {typeof item.userId === 'object' ? item.userId?.name : 'Customer'}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          urgency === 'high' ? "text-danger-700" : urgency === 'medium' ? "text-warning-700" : "text-gray-400"
                        )}>
                          {daysLeft} days left ({new Date(item.endDate).toLocaleDateString()})
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-text-primary">
                      ₹{(typeof item.planId === 'object' ? item.planId?.price : 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
