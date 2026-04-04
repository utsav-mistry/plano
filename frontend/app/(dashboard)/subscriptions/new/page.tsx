'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function NewSubscriptionPage() {
  const { success, error: toastError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [form, setForm] = useState({
    userId: '',
    planId: '',
    startDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  // Load plans and users for the dropdowns
  useEffect(() => {
    async function loadDeps() {
      try {
        const [plansRes, usersRes] = await Promise.all([
          api.plans.getAll(),
          api.users.getAll(),
        ]);
        if (plansRes.success) {
          const d = plansRes.data as any;
          setPlans(d.plans ?? d ?? []);
        }
        if (usersRes.success) {
          const d = usersRes.data as any;
          setUsers(d.users ?? d ?? []);
        }
      } catch {
        toastError('Failed to load form data', 'Could not fetch plans and users.');
      } finally {
        setLoadingDeps(false);
      }
    }
    loadDeps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.planId) {
      toastError('Validation error', 'Customer and Plan are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.subscriptions.create({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
      });
      if (res.success) {
        success('Subscription created!', 'The subscription is now in Draft status.');
        window.location.href = '/admin/subscriptions';
      }
    } catch (err: any) {
      toastError('Failed to create subscription', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = 'h-11 px-4 rounded-lg border border-border bg-bg-page text-sm font-medium outline-none transition-all focus:border-plano-500 w-full';
  const label = 'text-[11px] uppercase font-bold tracking-widest text-plano-700';

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/subscriptions"
          className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-plano-600 transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to Subscriptions
        </Link>
        <h1 className="text-4xl text-text-primary">New Subscription</h1>
        <p className="text-sm text-text-secondary font-medium">
          Create a new subscription in Draft status. You can activate it after review.
        </p>
      </div>

      {loadingDeps ? (
        <div className="flex items-center gap-3 py-20 justify-center text-text-secondary">
          <Loader2 size={20} className="animate-spin text-plano-600" />
          <span className="text-sm font-medium">Loading form data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-6">

          {/* Customer */}
          <div className="flex flex-col gap-1.5">
            <label className={label}>Customer *</label>
            <div className="relative">
              <select
                required
                value={form.userId}
                onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}
                className={`${field} appearance-none pr-10 cursor-pointer`}
                suppressHydrationWarning
              >
                <option value="">Select a customer...</option>
                {users.map((u: any) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Plan */}
          <div className="flex flex-col gap-1.5">
            <label className={label}>Plan *</label>
            <div className="relative">
              <select
                required
                value={form.planId}
                onChange={e => setForm(p => ({ ...p, planId: e.target.value }))}
                className={`${field} appearance-none pr-10 cursor-pointer`}
                suppressHydrationWarning
              >
                <option value="">Select a plan...</option>
                {plans.map((plan: any) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} — ₹{plan.basePrice?.toLocaleString('en-IN')} / {plan.billingCycle}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className={label}>Start Date</label>
            <input
              suppressHydrationWarning
              type="date"
              value={form.startDate}
              onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
              className={field}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className={label}>Internal Notes</label>
            <textarea
              rows={3}
              placeholder="Optional — any context about this subscription..."
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="px-4 py-3 rounded-lg border border-border bg-bg-page text-sm font-medium outline-none transition-all focus:border-plano-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <button
              suppressHydrationWarning
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold text-sm shadow-sm disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSubmitting ? 'Creating...' : 'Create Subscription'}
            </button>
            <Link
              href="/admin/subscriptions"
              className="px-6 py-2.5 rounded-btn border border-border text-sm font-bold text-text-secondary hover:bg-gray-50 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
