'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileSignature, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Edit2, 
  Trash2,
  Copy,
  ChevronRight,
  Clock,
  Briefcase
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const mockTemplates = [
  { id: '1', name: 'Enterprise Annual', validity: 30, plan: 'Yearly Pro', items: 3, total: 120000, currency: 'INR' },
  { id: '2', name: 'SaaS Monthly Starter', validity: 15, plan: 'Monthly Starter', items: 1, total: 2999, currency: 'INR' },
  { id: '3', name: 'Custom Executive', validity: 7, plan: 'Monthly Elite', items: 5, total: 45000, currency: 'INR' },
  { id: '4', name: 'Non-Profit Discounted', validity: 60, plan: 'Yearly Basic', items: 2, total: 15000, currency: 'INR' },
];

export default function QuotationTemplatesPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Quotation Templates</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
             Pre-configured templates to speed up your sales process.
          </p>
        </div>
        <Link 
          href="/quotations/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          Create Template
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-bg-surface p-4 rounded-card border border-border shadow-sm">
        <div className="relative flex-1 max-w-sm">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search templates..."
             className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:outline-none transition-all text-sm font-sans"
           />
        </div>
        <button className="flex items-center gap-2 px-4 h-10 border border-border bg-white rounded-input text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-50 transition-colors">
           <Filter size={14} />
           Filters
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {mockTemplates.map((template) => (
            <div key={template.id} className="bg-bg-surface border border-border rounded-card p-6 flex flex-col gap-5 hover:shadow-md hover:-translate-y-1 transition-all group">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-plano-50 text-plano-600 flex items-center justify-center">
                        <FileSignature size={20} />
                     </div>
                     <div className="flex flex-col">
                        <h3 className="text-lg font-sans font-bold text-text-primary group-hover:text-plano-600 transition-colors">{template.name}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                           <Clock size={12} className="text-warning-500" />
                           Valid for {template.validity} days
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-3 py-4 border-y border-gray-100">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Target Plan</span>
                     <span className="text-xs font-bold text-text-primary px-2 py-0.5 bg-gray-100 rounded-full">{template.plan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Included Items</span>
                     <span className="text-xs font-bold text-text-primary">{template.items} products</span>
                  </div>
               </div>

               <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Estimated Total</span>
                  <span className="text-2xl font-serif font-bold text-text-primary">{formatCurrency(template.total, template.currency)}</span>
               </div>

               <div className="mt-4 flex items-center justify-between">
                  <button className="px-4 py-2 bg-plano-600/10 text-plano-600 rounded-btn text-[11px] font-bold uppercase tracking-widest hover:bg-plano-600 hover:text-white transition-all shadow-sm">
                     Use Template
                  </button>
                  <div className="flex items-center gap-2">
                     <button className="p-2 rounded-btn border border-border bg-white text-gray-400 hover:text-plano-600 transition-all">
                        <Edit2 size={16} />
                     </button>
                     <button className="p-2 rounded-btn border border-border bg-white text-gray-400 hover:text-danger-600 transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
