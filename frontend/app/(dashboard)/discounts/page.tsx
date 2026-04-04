'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TicketPercent, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Power,
  Calendar,
  Users
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const mockDiscounts = [
  { id: '1', code: 'SUMMER20', name: 'Summer Promotion', type: 'percentage', value: 20, appliesTo: 'Products + Subscriptions', uses: 45, maxUses: 100, validFrom: 'Apr 01', validTo: 'Jun 30, 2025', isActive: true },
  { id: '2', code: 'WELCOME500', name: 'New User Bonus', type: 'fixed', value: 500, appliesTo: 'Subscriptions', uses: 120, maxUses: 200, validFrom: 'Jan 01', validTo: 'Dec 31, 2025', isActive: true },
  { id: '3', code: 'WINTER10', name: 'Flash Sale winter', type: 'percentage', value: 10, appliesTo: 'Products', uses: 15, maxUses: 50, validFrom: 'Nov 01', validTo: 'Dec 31, 2024', isActive: false },
];

export default function DiscountsPage() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Discounts</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
             Manage promotional offers and loyalty rules.
          </p>
        </div>
        <Link 
          href="/discounts/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          New Discount
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {mockDiscounts.map((discount) => (
            <div key={discount.id} className="bg-bg-surface border border-border rounded-card p-6 flex flex-col gap-5 hover:shadow-md hover:-translate-y-1 transition-all group overflow-hidden relative">
               {!discount.isActive && <div className="absolute inset-0 bg-gray-50/50 grayscale-[0.5] pointer-events-none z-0" />}
               
               <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-plano-50 text-plano-600 flex items-center justify-center border border-plano-100">
                        <TicketPercent size={20} />
                     </div>
                     <div className="flex flex-col">
                        <h3 className="text-lg font-sans font-bold text-text-primary uppercase tracking-tight group-hover:text-plano-600 transition-colors">{discount.code}</h3>
                        <span className="text-[10px] font-bold text-gray-400 tracking-widest">{discount.name}</span>
                     </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                     <MoreVertical size={18} />
                  </button>
               </div>

               <div className="flex flex-col gap-1 relative z-10">
                  <div className="flex items-end gap-1">
                     <span className="text-4xl font-serif font-bold text-text-primary">
                        {discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value, 'INR')}
                     </span>
                     <span className="text-xs font-bold text-gray-400 pb-2 uppercase tracking-widest">OFF</span>
                  </div>
                  <span className="text-[10px] font-bold text-plano-600 uppercase tracking-widest bg-plano-50 border border-plano-100 px-2.5 py-1 rounded-full self-start">
                     On: {discount.appliesTo}
                  </span>
               </div>

               <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 relative z-10">
                  <div className="flex items-center justify-between">
                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Usage Limit</span>
                        <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">{discount.uses} / {discount.maxUses} uses</span>
                     </div>
                     <div className="text-right flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Status</span>
                        <div className="flex items-center gap-1">
                           <div className={cn("w-1.5 h-1.5 rounded-full", discount.isActive ? "bg-success-500" : "bg-gray-300")} />
                           <span className={cn("text-[10px] uppercase font-bold", discount.isActive ? "text-success-700" : "text-gray-400")}>
                              {discount.isActive ? 'Active' : 'Disabled'}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className={cn("h-full rounded-full transition-all duration-1000", discount.isActive ? "bg-plano-600" : "bg-gray-300")} style={{ width: `${(discount.uses / discount.maxUses) * 100}%` }}></div>
                  </div>
               </div>

               <div className="mt-2 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                     <Calendar size={14} className="text-gray-400" />
                     {discount.validFrom} → {discount.validTo}
                  </div>
                  <div className="flex items-center gap-2">
                     <button className={cn("p-2 rounded-btn transition-colors", discount.isActive ? "text-gray-400 hover:text-warning-600 hover:bg-warning-50" : "text-success-600 hover:bg-success-50")}>
                        <Power size={16} />
                     </button>
                     <button className="p-2 rounded-btn text-gray-400 hover:text-plano-600 hover:bg-plano-50 transition-colors">
                        <Edit2 size={16} />
                     </button>
                     <button className="p-2 rounded-btn text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-colors">
                        <Trash2 size={16} />
                     </button>
                  </div>
               </div>
            </div>
         ))}

         {/* Add New Empty State Card */}
         <Link href="/discounts/new" className="bg-bg-page border-2 border-dashed border-border rounded-card p-6 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-plano-400 transition-all group shrink-0 h-full min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-plano-50 flex items-center justify-center text-gray-400 group-hover:text-plano-600 transition-all">
               <Plus size={24} />
            </div>
            <div className="flex flex-col items-center">
               <span className="text-sm font-bold text-text-secondary group-hover:text-plano-600 transition-all">Add Discount Tier</span>
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center mt-1">Configure coupons & rules</span>
            </div>
         </Link>
      </div>
    </div>
  );
}
