'use client';

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  UserPlus,
  Plus,
  ArrowRight
} from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import StatusDonut from '@/components/dashboard/StatusDonut';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/lib/api';
import { KPIStats } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<KPIStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.reports.getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
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
          <h1 className="text-4xl">Good morning, {user?.name.split(' ')[0] || 'User'} 👋</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
            Here's what's happening with Plano today.
          </p>
        </div>
        <Link 
          href="/subscriptions/new"
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
            <Link href="/subscriptions" className="text-xs font-semibold text-plano-600 hover:underline flex items-center gap-1 uppercase tracking-widest">
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
                {[
                  { id: 'SUB-00142', customer: 'Acme Corp', plan: 'Monthly Pro', amount: '₹12,450', status: 'ACTIVE' },
                  { id: 'SUB-00141', customer: 'TechSolve Ltd', plan: 'Annual Starter', amount: '₹2,500', status: 'PAUSED' },
                  { id: 'SUB-00140', customer: 'StartupX', plan: 'Monthly Elite', amount: '₹24,999', status: 'ACTIVE' },
                  { id: 'SUB-00139', customer: 'Global Labs', plan: 'Monthly Pro', amount: '₹12,450', status: 'CONFIRMED' },
                  { id: 'SUB-00138', customer: 'Infinity Soft', plan: 'Monthly Starter', amount: '₹4,500', status: 'ACTIVE' },
                ].map((row, idx) => (
                  <tr key={idx} className="group hover:bg-gray-25 transition-colors">
                    <td className="py-4 px-2 font-mono text-xs text-text-secondary">{row.id}</td>
                    <td className="py-4 px-2 text-sm font-medium">{row.customer}</td>
                    <td className="py-4 px-2 text-xs text-text-secondary font-medium">{row.plan}</td>
                    <td className="py-4 px-2 font-mono text-xs font-semibold">{row.amount}</td>
                    <td className="py-4 px-2">
                       <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                        row.status === 'ACTIVE' ? "bg-success-50 text-success-700" : row.status === 'PAUSED' ? "bg-warning-50 text-warning-700" : "bg-info-50 text-info-700"
                       )}>
                        {row.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-bg-surface p-6 rounded-card border border-border mt-2">
           <h3 className="text-xl font-serif font-bold text-text-primary mb-6">Upcoming Renewals</h3>
           <div className="flex flex-col gap-4">
              {[
                { name: 'Acme Corp', days: 7, amt: '₹12,000', urgency: 'low' },
                { name: 'TechSolve Ltd', days: 3, amt: '₹5,500', urgency: 'medium' },
                { name: 'StartupX', days: 1, amt: '₹24,999', urgency: 'high' },
                { name: 'Global Labs', days: 12, amt: '₹12,450', urgency: 'low' },
                { name: 'CloudPeak', days: 2, amt: '₹4,500', urgency: 'high' },
              ].map((item, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between p-3 rounded-lg border-l-4 transition-all hover:bg-gray-50",
                  item.urgency === 'high' ? "border-danger-500 bg-danger-50/10" : item.urgency === 'medium' ? "border-warning-500 bg-warning-50/10" : "border-border bg-gray-50/20"
                )}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{item.name}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase",
                        item.urgency === 'high' ? "text-danger-700" : item.urgency === 'medium' ? "text-warning-700" : "text-gray-400"
                      )}>
                        {item.days} days left
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-text-primary">{item.amt}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
