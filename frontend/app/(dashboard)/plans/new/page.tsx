'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  ArrowLeft, 
  Save, 
  Info, 
  Layers, 
  IndianRupee, 
  Check,
  Loader2,
  ChevronDown,
  X,
  Zap,
  Calendar,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly', icon: <Calendar size={14} /> },
  { value: 'quarterly', label: 'Quarterly', icon: <Layers size={14} /> },
  { value: 'semi_annual', label: 'Half Yearly', icon: <Layers size={14} /> },
  { value: 'annual', label: 'Yearly', icon: <Calendar size={14} /> },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export default function NewPlanPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [form, setForm] = useState({
    name: '',
    description: '',
    productId: '',
    billingCycle: 'monthly',
    price: '',
    currency: 'INR',
    trialDays: '0',
    features: [] as string[],
  });

  useEffect(() => {
    api.products.getAll().then(res => {
      if (res.success) {
        const d = res.data as any;
        setProducts(d.products ?? d ?? []);
      }
    }).finally(() => setLoadingDeps(false));
  }, []);

  const addFeature = () => {
    if (featureInput.trim() && !form.features.includes(featureInput.trim())) {
      setForm(p => ({ ...p, features: [...p.features, featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const removeFeature = (f: string) =>
    setForm(p => ({ ...p, features: p.features.filter(x => x !== f) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || !form.name || !form.price) {
      toastError('Validation', 'Missing required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.plans.create({
        ...form,
        price: Number(form.price),
        trialDays: Number(form.trialDays),
      });
      if (res.success) {
        success('Plan active!', 'Your new billing plan is now live.');
        router.push('/plans');
      }
    } catch (err: any) {
      toastError('Setup failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "text-[11px] uppercase font-bold text-gray-500 tracking-widest mb-1.5 flex items-center gap-1.5";
  const inputStyle = "w-full h-11 px-4 rounded-lg border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans shadow-sm";

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/plans" className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-plano-600 transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl text-text-primary">Create Subscription Plan</h1>
            <p className="text-sm text-text-secondary font-medium uppercase tracking-[0.2em] text-[10px]">
              Catalog / Plans / Configuration
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-plano-50 rounded-full blur-3xl opacity-40"></div>
            
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 relative">
              <div className="w-10 h-10 rounded-xl bg-plano-50 text-plano-600 flex items-center justify-center border border-plano-100 shadow-sm">
                <Layers size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">Core Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div className="flex flex-col">
                <label className={labelStyle}>Link to Product *</label>
                <div className="relative">
                  <select 
                    suppressHydrationWarning
                    required
                    value={form.productId}
                    onChange={(e) => setForm({...form, productId: e.target.value})}
                    className={cn(inputStyle, "appearance-none pr-10 cursor-pointer")}
                    disabled={loadingDeps}
                  >
                    <option value="">Choose product...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.type})</option>
                    ))}
                  </select>
                  {loadingDeps ? (
                    <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-300" />
                  ) : (
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>Plan Name *</label>
                <input 
                  suppressHydrationWarning
                  required
                  type="text" 
                  placeholder="e.g. Pro Monthly Tier"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <label className={labelStyle}>Billing Cycle *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {BILLING_CYCLES.map((cycle) => (
                    <button 
                      key={cycle.value}
                      type="button"
                      onClick={() => setForm({...form, billingCycle: cycle.value})}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 relative",
                        form.billingCycle === cycle.value 
                          ? "bg-plano-900 border-plano-900 text-white shadow-lg" 
                          : "bg-white border-border text-text-secondary hover:border-plano-200"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest">{cycle.label}</span>
                      {form.billingCycle === cycle.value && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center text-white border-2 border-white">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <label className={labelStyle}>Description</label>
                <textarea 
                  rows={3}
                  placeholder="Summarize the core value proposition of this plan..."
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className={cn(inputStyle, "h-24 py-4 resize-none")}
                />
              </div>
            </div>
          </section>

          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center border border-success-100 shadow-sm">
                <IndianRupee size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">Pricing & Logistics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col">
                <label className={labelStyle}>Price *</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-gray-200 pr-3 mr-3">
                    {form.currency === 'INR' ? '₹' : '$'}
                  </div>
                  <input 
                    suppressHydrationWarning
                    required
                    type="number" 
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                    className={cn(inputStyle, "pl-14 font-mono font-bold")}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>Currency</label>
                <div className="relative">
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({...form, currency: e.target.value})}
                    className={cn(inputStyle, "appearance-none pr-10 cursor-pointer")}
                    suppressHydrationWarning
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>Trial (Days)</label>
                <input 
                  suppressHydrationWarning
                  type="number" 
                  placeholder="0"
                  value={form.trialDays}
                  onChange={(e) => setForm({...form, trialDays: e.target.value})}
                  className={inputStyle}
                />
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex items-center gap-4">
             <button 
               type="submit"
               disabled={isSubmitting}
               className="flex-1 h-14 rounded-xl bg-plano-600 text-white text-lg font-bold hover:bg-black transition-all shadow-xl hover:shadow-2xl disabled:opacity-60 flex items-center justify-center gap-3"
             >
               {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
               {isSubmitting ? 'Creating Plan...' : 'Publish Subscription Plan'}
             </button>
             <Link 
               href="/plans"
               className="px-10 h-14 rounded-xl border-2 border-border bg-white text-lg font-bold text-text-secondary hover:bg-gray-50 transition-all flex items-center justify-center"
             >
               Discard
             </Link>
          </div>
        </div>

        {/* Right Sidebar: Features & Preview */}
        <div className="flex flex-col gap-6">
           <section className="bg-white p-6 rounded-card border border-border shadow-sm flex flex-col gap-6">
              <label className={labelStyle}>Featured Benefits</label>
              <div className="flex gap-2">
                 <input 
                    suppressHydrationWarning
                    type="text" 
                    placeholder="e.g. 24/7 Support"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className={inputStyle}
                 />
                 <button 
                   type="button"
                   onClick={addFeature}
                   className="w-11 h-11 rounded-lg bg-plano-900 text-white flex items-center justify-center shrink-0 hover:bg-black transition-colors"
                 >
                   <Plus size={20} />
                 </button>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                 {form.features.length === 0 ? (
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic text-center py-4 border-2 border-dashed border-gray-100 rounded-lg">
                     No features listed yet
                   </p>
                 ) : (
                   form.features.map((f, i) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-border group">
                        <span className="text-xs font-bold text-text-primary flex items-center gap-2">
                          <Check size={14} className="text-success-600" />
                          {f}
                        </span>
                        <button type="button" onClick={() => removeFeature(f)} className="text-gray-300 hover:text-danger-600 transition-colors opacity-0 group-hover:opacity-100">
                          <X size={14} />
                        </button>
                     </div>
                   ))
                 )}
              </div>
           </section>

           {/* Plan Preview */}
           <div className="bg-plano-900 rounded-card p-8 flex flex-col gap-6 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                 <Zap size={24} className="text-plano-400 opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-plano-500 rounded-full blur-[80px] opacity-20"></div>

              <div className="flex flex-col gap-1.5 relative">
                 <span className="text-[10px] font-bold text-plano-400 uppercase tracking-[0.3em]">
                   {form.billingCycle.replace('_', ' ')} / {form.currency}
                 </span>
                 <h3 className="text-3xl font-serif font-bold leading-tight">
                   {form.name || 'Untitled Plan'}
                 </h3>
              </div>

              <div className="flex items-baseline gap-1 mt-2">
                 <span className="text-4xl font-serif font-bold">{formatCurrency(Number(form.price) || 0, form.currency)}</span>
                 <span className="text-xs font-bold text-plano-400 uppercase">/ {form.billingCycle.split('_')[0]}</span>
              </div>

              <div className="flex flex-col gap-3 mt-4 border-t border-white/10 pt-6">
                 {form.features.slice(0, 4).map((f, i) => (
                   <div key={i} className="flex items-center gap-3 text-xs font-medium text-plano-100">
                      <Sparkles size={12} className="text-plano-400 shrink-0" />
                      {f}
                   </div>
                 ))}
                 {form.features.length > 4 && (
                   <div className="text-[10px] font-bold uppercase tracking-widest text-plano-400 ml-6">
                     + {form.features.length - 4} More Benefits
                   </div>
                 )}
              </div>

              <button disabled type="button" className="w-full h-12 rounded-xl bg-white text-plano-900 font-bold text-sm shadow-xl">
                 Select This Plan
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
