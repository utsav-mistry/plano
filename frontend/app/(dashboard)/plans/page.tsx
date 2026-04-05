'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarClock, Plus, Search, MoreVertical, Copy, Trash2,
  Edit2, Clock, CheckCircle2, AlertCircle, Loader2, FileText
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Plan } from '@/types';
import { toAdminPath } from '@/lib/path-scoping';

export default function PlansPage() {
  const pathname = usePathname();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [editTarget, setEditTarget] = useState<Plan | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    billingCycle: 'monthly',
    price: '',
    trialDays: '0',
    isActive: true,
  });
  const { error: toastError, success } = useToast();

  useEffect(() => { fetchPlans(); }, []);

  async function fetchPlans() {
    setIsLoading(true); setError(null);
    try {
      const res = await api.plans.getAll();
      if (res.success) {
        const d = res.data as { plans?: Plan[] } | Plan[];
        setPlans(Array.isArray(d) ? d : (d.plans ?? []));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load plans');
    } finally { setIsLoading(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.plans.delete(id);
      success('Plan deactivated');
      fetchPlans();
      setDeleteTarget(null);
    } catch (err: unknown) { toastError('Failed', err instanceof Error ? err.message : 'Failed'); }
  }

  function openEdit(plan: Plan) {
    setEditTarget(plan);
    setEditForm({
      name: plan.name || '',
      description: plan.description || '',
      billingCycle: (plan.billingCycle as string) || 'monthly',
      price: String(plan.price ?? 0),
      trialDays: String(plan.trialDays ?? 0),
      isActive: !!plan.isActive,
    });
  }

  async function handleUpdatePlan() {
    if (!editTarget) return;
    setIsUpdating(true);
    try {
      const payload = {
        ...editForm,
        price: Number(editForm.price),
        trialDays: Number(editForm.trialDays),
      };
      await api.plans.update(editTarget.id, payload);
      success('Plan updated');
      setEditTarget(null);
      await fetchPlans();
    } catch (err: unknown) {
      toastError('Update failed', err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Recurring Plans</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
            Design and offer various subscription structures.
          </p>
        </div>
        <Link href={toAdminPath(pathname, '/plans/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm">
          <Plus size={18} /> Create Plan
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 bg-bg-surface p-4 rounded-card border border-sidebar-hover shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search plans..."
            className="w-full h-10 pl-10 pr-4 rounded-input border border-border dark:border-sidebar-hover bg-gray-25 dark:bg-white/5 focus:border-plano-500 dark:focus:bg-white/10 focus:outline-none transition-all text-sm font-sans text-text-primary" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-text-secondary">
          <Loader2 size={22} className="animate-spin text-plano-600" />
          <span className="text-sm font-medium uppercase tracking-widest">Loading plans...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <AlertCircle size={32} className="text-danger-400" />
          <p className="text-sm font-bold text-danger-600 uppercase">{error}</p>
          <button onClick={fetchPlans} className="text-xs font-bold text-plano-600 underline uppercase tracking-widest">Retry</button>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
            <FileText size={32} />
          </div>
          <p className="text-lg font-serif font-bold text-text-primary uppercase tracking-tight">No plans yet</p>
          <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Create your first recurring plan to get started.</p>
          <Link href={toAdminPath(pathname, '/plans/new')}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm">
            <Plus size={16} /> Create Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id}
              className="bg-bg-surface border border-sidebar-hover rounded-card p-6 flex flex-col gap-6 hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-plano-50 dark:bg-white/10 text-plano-400 flex items-center justify-center">
                    <CalendarClock size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-sans font-bold text-text-primary leading-tight group-hover:text-plano-400 transition-colors">
                      {plan.name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">
                      {plan.billingCycle} billing
                    </span>
                  </div>
                </div>
                <span className={cn(
                  'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                  plan.isActive ? 'bg-success-50 dark:bg-success-900/20 text-success-600' : 'bg-gray-100 dark:bg-white/10 text-gray-500'
                )}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-3xl font-serif font-bold text-text-primary">
                  {formatCurrency(plan.price || 0, plan.currency)}
                </span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  per unit / {plan.billingCycle}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-full bg-plano-50 text-plano-600 border border-plano-100 text-[10px] font-bold uppercase tracking-widest">
                  Recurring plan
                </span>
                <span className="px-2 py-1 rounded-full bg-plano-50 text-plano-600 border border-plano-100 text-[10px] font-bold uppercase tracking-widest">
                  {plan.billingCycle} cycle
                </span>
                <span className={cn(
                  'px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest',
                  plan.isAutoClose ? 'bg-warning-50 text-warning-600 border-warning-100' : 'bg-success-50 text-success-600 border-success-100'
                )}>
                  {plan.isAutoClose ? 'Auto-close' : 'Auto-renew'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-sidebar-hover">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-[0.2em]">Trial Period</span>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-secondary">
                    <Clock size={12} className="text-plano-400" />
                    {plan.trialDays || 0} days free
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-[0.2em]">Product</span>
                  <span className="text-[11px] font-bold text-text-secondary truncate uppercase">
                    {typeof plan.productId === 'object' ? plan.productId?.name : '—'}
                  </span>
                </div>
              </div>

              {plan.description && (
                <p className="text-xs text-text-secondary italic leading-relaxed line-clamp-2">{plan.description}</p>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => openEdit(plan)}
                  className="text-[11px] uppercase font-bold text-text-secondary hover:text-plano-400 transition-all flex items-center gap-1 tracking-widest">
                  <Edit2 size={14} /> Edit
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setDeleteTarget(plan)}
                    className="p-2 rounded-btn border border-border dark:border-sidebar-hover bg-bg-surface text-gray-400 hover:text-danger-600 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-card border border-sidebar-hover bg-bg-surface p-6 shadow-2xl">
            <h3 className="text-xl font-serif font-bold text-text-primary">Delete Plan</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Delete <span className="font-bold text-text-primary">{deleteTarget.name}</span>? This cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-btn border border-border text-text-secondary hover:bg-sidebar-hover">Cancel</button>
              <button onClick={() => handleDelete(deleteTarget.id)} className="px-4 py-2 rounded-btn bg-danger-600 text-white hover:bg-danger-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-card border border-sidebar-hover bg-bg-surface p-6 shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-text-primary">Edit Plan</h3>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} placeholder="Plan name" className="h-11 px-4 rounded-lg border border-border bg-white text-sm" />
              <select value={editForm.billingCycle} onChange={(e) => setEditForm((p) => ({ ...p, billingCycle: e.target.value }))} className="h-11 px-4 rounded-lg border border-border bg-white text-sm">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <input type="number" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))} placeholder="Price" className="h-11 px-4 rounded-lg border border-border bg-white text-sm" />
              <input type="number" value={editForm.trialDays} onChange={(e) => setEditForm((p) => ({ ...p, trialDays: e.target.value }))} placeholder="Trial days" className="h-11 px-4 rounded-lg border border-border bg-white text-sm" />
              <label className="md:col-span-2 flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active plan
              </label>
              <textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="md:col-span-2 h-28 p-4 rounded-lg border border-border bg-white text-sm resize-none" />
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 rounded-btn border border-border text-text-secondary hover:bg-sidebar-hover">Cancel</button>
              <button onClick={handleUpdatePlan} disabled={isUpdating} className="px-4 py-2 rounded-btn bg-plano-600 text-white hover:bg-plano-700 disabled:opacity-70">
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
