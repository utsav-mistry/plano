'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  ArrowLeft, 
  Save, 
  Info, 
  Layers, 
  IndianRupee, 
  PackageCheck,
  Check,
  Loader2,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const PRODUCT_TYPES = [
  { value: 'software', label: 'Software', icon: <Layers size={18} /> },
  { value: 'service', label: 'Service', icon: <PackageCheck size={18} /> },
  { value: 'addon', label: 'Addon', icon: <Plus size={18} /> },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export default function NewProductPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    type: 'software',
    basePrice: '',
    currency: 'INR',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.basePrice) {
      toastError('Validation Error', 'Product name and price are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.products.create({
        ...form,
        basePrice: Number(form.basePrice)
      });
      if (res.success) {
        success('Product published!', 'The product is now live in your catalog.');
        router.push('/products');
      }
    } catch (err: any) {
      toastError('Failed to create product', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "text-[11px] uppercase font-bold text-gray-500 tracking-widest mb-1.5 flex items-center gap-1.5";
  const inputStyle = "w-full h-11 px-4 rounded-lg border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans";

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products" className="p-2.5 rounded-full border border-border hover:bg-gray-50 transition-colors group">
            <ArrowLeft size={18} className="text-gray-400 group-hover:text-plano-600 transition-colors" />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl text-text-primary">Add New Product</h1>
            <p className="text-sm text-text-secondary font-medium uppercase tracking-widest text-[10px]">
              Catalog / Products / Create
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-plano-50 text-plano-600 flex items-center justify-center">
                <Info size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">General Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className={labelStyle}>Product Name *</label>
                <input 
                  suppressHydrationWarning
                  required
                  type="text" 
                  placeholder="e.g. Enterprise CRM Suite"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className={inputStyle}
                />
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}>SKU / Identifier</label>
                <input 
                  suppressHydrationWarning
                  type="text" 
                  placeholder="e.g. CRM-ENT-001"
                  value={form.sku}
                  onChange={(e) => setForm({...form, sku: e.target.value.toUpperCase()})}
                  className={cn(inputStyle, "uppercase font-mono")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className={labelStyle}>Product Type *</label>
              <div className="grid grid-cols-3 gap-4">
                {PRODUCT_TYPES.map((type) => (
                  <button 
                    key={type.value}
                    type="button"
                    onClick={() => setForm({...form, type: type.value})}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group",
                      form.type === type.value 
                        ? "bg-plano-50 border-plano-500 text-plano-700 shadow-md ring-4 ring-plano-500/10" 
                        : "bg-white border-border text-text-secondary hover:border-plano-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      form.type === type.value ? "bg-plano-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-plano-50"
                    )}>
                      {type.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">{type.label}</span>
                    {form.type === type.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-plano-600 rounded-full flex items-center justify-center text-white">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelStyle}>Description</label>
              <textarea 
                rows={5}
                placeholder="What does this product do? Highlight key features..."
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className={cn(inputStyle, "h-32 py-4 resize-none")}
              />
            </div>
          </section>

          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center">
                <IndianRupee size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary">Pricing Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className={labelStyle}>Base Price *</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-gray-200 pr-3 mr-3">
                    {form.currency === 'INR' ? '₹' : '$'}
                  </div>
                  <input 
                    suppressHydrationWarning
                    required
                    type="number" 
                    placeholder="0.00"
                    value={form.basePrice}
                    onChange={(e) => setForm({...form, basePrice: e.target.value})}
                    className={cn(inputStyle, "pl-14 font-mono font-bold text-lg")}
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
                    {CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4">
             <button 
               type="submit"
               disabled={isSubmitting}
               className="flex-1 h-14 rounded-xl bg-plano-600 text-white text-lg font-bold hover:bg-plano-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-3"
             >
               {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
               {isSubmitting ? 'Publishing Product...' : 'Publish Product'}
             </button>
             <Link 
               href="/products"
               className="px-10 h-14 rounded-xl border-2 border-border bg-white text-lg font-bold text-text-secondary hover:bg-gray-50 transition-all flex items-center justify-center"
             >
               Cancel
             </Link>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="flex flex-col gap-6">
           <div className="bg-white rounded-card border-2 border-dashed border-border p-6 flex flex-col gap-6 sticky top-24">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Product Preview</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-success-500"></div>
                  <div className="w-2 h-2 rounded-full bg-success-500/30"></div>
                </div>
              </div>

              <div className="bg-bg-page border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-plano-50 rounded-full blur-3xl opacity-60"></div>
                
                <div className="flex flex-col gap-1.5 relative">
                  <span className="text-[10px] font-bold text-plano-600 uppercase tracking-widest bg-plano-50 px-2.5 py-1 rounded-full w-fit">
                    {form.type}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-text-primary leading-tight line-clamp-2">
                    {form.name || 'Untitled Offering'}
                  </h3>
                </div>

                <div className="flex flex-col gap-0.5 mt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Rate</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-bold text-text-primary">
                      {formatCurrency(Number(form.basePrice) || 0, form.currency)}
                    </span>
                  </div>
                </div>

                {form.description && (
                  <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed border-t border-gray-100 pt-4 italic">
                    {form.description}
                  </p>
                )}

                <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-border">
                  <div className="flex items-center gap-3 text-xs font-bold text-text-primary mb-3 uppercase tracking-tighter">
                    <Check size={14} className="text-success-600" />
                    Included in Catalog
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-text-primary uppercase tracking-tighter">
                    <Check size={14} className="text-success-600" />
                    Billed via Plano
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 text-center px-4">
                <p className="text-xs text-text-secondary font-medium leading-relaxed">
                  Published products are immediately available to be added to plans or quotations.
                </p>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
