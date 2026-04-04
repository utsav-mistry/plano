'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  ArrowLeft, 
  Save, 
  HelpCircle, 
  Info, 
  Layers, 
  IndianRupee, 
  Trash2,
  PackageCheck,
  Check
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function NewProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    type: 'software',
    basePrice: 0,
    costPrice: 0,
    description: '',
    isRecurring: true,
    billingCycle: 'monthly',
  });

  const productTypes = [
    { value: 'software', label: 'Software', icon: <Layers size={18} /> },
    { value: 'service', label: 'Service', icon: <PackageCheck size={18} /> },
    { value: 'addon', label: 'Addon', icon: <Plus size={18} /> },
  ];

  const cycles = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products" className="p-2 rounded-full border border-border hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} className="text-gray-400" />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl text-text-primary">Add New Product</h1>
            <p className="text-sm text-text-secondary font-medium uppercase tracking-widest text-[10px]">Catalog / Products / New</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 rounded-btn border border-border bg-white text-sm font-bold text-text-secondary hover:bg-gray-50 transition-all">
            Save as Draft
          </button>
          <button className="px-6 py-2.5 rounded-btn bg-plano-600 text-white text-sm font-bold hover:bg-plano-700 transition-all shadow-sm flex items-center gap-2">
            <Save size={16} />
            Publish Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Main */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Section: Basic Information */}
          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-6">
             <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-plano-50 text-plano-600 flex items-center justify-center">
                   <Info size={16} />
                </div>
                <h2 className="text-xl font-serif font-bold text-text-primary">Basic Information</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] uppercase font-bold text-gray-500 flex items-center gap-1">Product Name *</label>
                   <input 
                    type="text" 
                    placeholder="Enter product name..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-11 px-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans"
                   />
                </div>
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] uppercase font-bold text-gray-500 flex items-center gap-1">SKU identifier</label>
                   <input 
                    type="text" 
                    placeholder="e.g. PRO-ANLY-2025"
                    className="w-full h-11 px-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans uppercase font-mono"
                   />
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <label className="text-[11px] uppercase font-bold text-gray-500">Product Type *</label>
                <div className="grid grid-cols-3 gap-4">
                   {productTypes.map((type) => (
                      <button 
                         key={type.value}
                         type="button"
                         onClick={() => setFormData({...formData, type: type.value})}
                         className={cn(
                            "flex flex-col items-center justify-center gap-3 p-5 rounded-btn border transition-all duration-300",
                            formData.type === type.value 
                                ? "bg-plano-50 border-plano-500 text-plano-700 shadow-sm ring-1 ring-plano-500" 
                                : "bg-white border-border text-text-secondary hover:border-border-strong"
                         )}
                      >
                         {type.icon}
                         <span className="text-xs font-bold uppercase tracking-widest">{type.label}</span>
                         {formData.type === type.value && <Check size={14} className="absolute top-2 right-2 text-plano-600" />}
                      </button>
                   ))}
                </div>
             </div>

             <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase font-bold text-gray-500">Product Description</label>
                <textarea 
                   rows={4}
                   placeholder="Briefly describe what this product offers..."
                   className="w-full p-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans resize-none"
                />
             </div>
          </section>

          {/* Section: Pricing */}
          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-6">
             <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-success-50 text-success-600 flex items-center justify-center">
                   <IndianRupee size={16} />
                </div>
                <h2 className="text-xl font-serif font-bold text-text-primary">Pricing Structure</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] uppercase font-bold text-gray-500">Sales Price (Annual/Monthly) *</label>
                   <div className="relative">
                      <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number" 
                        value={formData.basePrice}
                        onChange={(e) => setFormData({...formData, basePrice: Number(e.target.value)})}
                        className="w-full h-11 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans font-bold"
                      />
                   </div>
                </div>
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] uppercase font-bold text-gray-500">Cost Price (Internal)</label>
                   <div className="relative">
                      <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number" 
                        className="w-full h-11 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans font-bold"
                      />
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between p-4 rounded-btn bg-gray-50 border border-border">
                   <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-text-primary tracking-tight">Recurring Pricing</span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Enable subscription billing</span>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}
                     className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        formData.isRecurring ? "bg-plano-600" : "bg-gray-300"
                     )}
                   >
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", formData.isRecurring ? "right-1" : "left-1")} />
                   </button>
                </div>

                {formData.isRecurring && (
                  <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
                     <label className="text-[11px] uppercase font-bold text-gray-500">Billing Period</label>
                     <div className="flex gap-2">
                        {cycles.map((item) => (
                           <button 
                             key={item.value}
                             type="button"
                             onClick={() => setFormData({...formData, billingCycle: item.value})}
                             className={cn(
                               "px-6 py-2 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all",
                               formData.billingCycle === item.value 
                                   ? "bg-plano-600 border-plano-600 text-white shadow-md scale-105" 
                                   : "bg-white border-border text-gray-400 hover:border-border-strong"
                             )}
                           >
                              {item.label}
                           </button>
                        ))}
                     </div>
                  </div>
                )}
             </div>
          </section>
        </div>

        {/* Right Column: Live Preview & Settings */}
        <div className="flex flex-col gap-6">
           {/* Section: Live Preview */}
           <div className="bg-white rounded-card border-2 border-dashed border-border p-6 flex flex-col gap-4 sticky top-24">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Live Preview</span>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-success-500"></div>
                 </div>
              </div>
              
              <div className="bg-bg-page p-6 rounded-card border border-border flex flex-col gap-4 relative overflow-hidden">
                 {/* Visual Accent */}
                 <div className="absolute top-0 right-0 w-20 h-20 bg-plano-100 rounded-bl-[100%] opacity-50"></div>
                 
                 <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-[9px] uppercase font-bold text-plano-600 tracking-[0.2em]">{formData.type}</span>
                    <h3 className="text-xl font-sans font-bold text-text-primary truncate">{formData.name || 'Your Brand Product'}</h3>
                 </div>

                 <div className="flex flex-col gap-0.5 relative z-10">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Pricing Model</span>
                    <div className="flex items-end gap-1">
                       <span className="text-3xl font-serif font-bold text-text-primary">{formatCurrency(formData.basePrice)}</span>
                       {formData.isRecurring && <span className="text-xs font-semibold text-gray-400 pb-1.5">/ {formData.billingCycle}</span>}
                    </div>
                 </div>

                 <div className="mt-4 flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                       <HelpCircle size={10} className="text-gray-400" />
                       <span className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.15em]">Subscription details</span>
                    </div>
                    {[
                      { icon: <Check size={10} />, text: 'Automated Billing' },
                      { icon: <Check size={10} />, text: 'Dashboard Analytics' },
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-text-secondary">
                        <div className="w-3.5 h-3.5 rounded-full bg-success-50 text-success-700 flex items-center justify-center">
                          {feat.icon}
                        </div>
                        {feat.text}
                      </div>
                    ))}
                 </div>

                 <button className="mt-4 w-full h-10 bg-plano-600/10 text-plano-600 rounded-btn text-xs font-bold uppercase tracking-widest hover:bg-plano-600 hover:text-white transition-all">
                    Subscribe Now
                 </button>
              </div>
              
              <div className="flex flex-col gap-4 mt-2">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary">Tax Applicable</span>
                    <button className="w-10 h-5 bg-gray-200 rounded-full cursor-not-allowed opacity-50 relative">
                       <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white"></div>
                    </button>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary">Track Inventory</span>
                    <button className="w-10 h-5 bg-gray-200 rounded-full cursor-not-allowed opacity-50 relative">
                       <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white"></div>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
