'use client';

import React, { useState } from 'react';
import { 
  Percent, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  SmartphoneIcon,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockTaxes = [
  { id: '1', name: 'IGST', type: 'percentage', rate: 18, description: 'Integrated Goods & Services Tax' },
  { id: '2', name: 'CGST', type: 'percentage', rate: 9, description: 'Central Goods & Services Tax' },
  { id: '3', name: 'SGST', type: 'percentage', rate: 9, description: 'State Goods & Services Tax' },
  { id: '4', name: 'Cess (Luxury)', type: 'percentage', rate: 4, description: 'Additional cess on luxury items' },
];

export default function TaxesManagementPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary uppercase tracking-tight">Tax Rules</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
             Manage global and region-specific tax configurations.
          </p>
        </div>
        <button 
          onClick={() => setShowDrawer(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          Add Tax Rule
        </button>
      </div>

      {/* Tax List Table */}
      <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Tax Rule Name</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Type</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Rate</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Description</th>
                     <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {mockTaxes.map((tax) => (
                     <tr key={tax.id} className={cn("group transition-colors", editingId === tax.id ? "bg-plano-50/50" : "hover:bg-gray-25")}>
                        <td className="py-5 px-6">
                           {editingId === tax.id ? (
                               <input 
                                 type="text" 
                                 defaultValue={tax.name}
                                 className="w-full h-9 px-3 rounded border border-plano-300 bg-white focus:outline-none text-sm font-bold"
                               />
                           ) : (
                               <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded bg-plano-50 text-plano-600 flex items-center justify-center border border-plano-100">
                                     <Percent size={14} />
                                  </div>
                                  <span className="text-sm font-bold text-text-primary">{tax.name}</span>
                               </div>
                           )}
                        </td>
                        <td className="py-5 px-6">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tax.type}</span>
                        </td>
                        <td className="py-5 px-6">
                           {editingId === tax.id ? (
                               <div className="flex items-center gap-1">
                                  <input 
                                    type="number" 
                                    defaultValue={tax.rate}
                                    className="w-20 h-9 px-3 rounded border border-plano-300 bg-white focus:outline-none text-sm font-bold"
                                  />
                                  <span className="text-sm font-bold">%</span>
                               </div>
                           ) : (
                               <span className="text-lg font-serif font-bold text-text-primary">{tax.rate}%</span>
                           )}
                        </td>
                        <td className="py-5 px-6">
                           {editingId === tax.id ? (
                               <input 
                                 type="text" 
                                 defaultValue={tax.description}
                                 className="w-full h-9 px-3 rounded border border-plano-300 bg-white focus:outline-none text-xs font-medium"
                               />
                           ) : (
                               <span className="text-xs text-text-secondary font-medium">{tax.description}</span>
                           )}
                        </td>
                        <td className="py-5 px-6 text-right">
                           {editingId === tax.id ? (
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => setEditingId(null)}
                                    className="p-2 rounded-btn bg-success-500 text-white hover:bg-success-600 transition-all shadow-md"
                                  >
                                     <Check size={16} />
                                  </button>
                                  <button 
                                    onClick={() => setEditingId(null)}
                                    className="p-2 rounded-btn bg-white border border-border text-gray-400 hover:bg-gray-100 transition-all shadow-sm"
                                  >
                                     <X size={16} />
                                  </button>
                               </div>
                           ) : (
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => setEditingId(tax.id)}
                                    className="p-2 rounded-btn text-gray-400 hover:text-plano-600 hover:bg-plano-50 transition-colors"
                                  >
                                     <Edit2 size={16} />
                                  </button>
                                  <button className="p-2 rounded-btn text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-colors">
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Drawer Overlay Mock */}
      {showDrawer && (
         <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
               <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold text-text-primary">Add Tax Rule</h2>
                  <button onClick={() => setShowDrawer(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                     <label className="text-[11px] uppercase font-bold text-gray-500 flex items-center gap-1">
                        Tax Name *
                     </label>
                     <input 
                       type="text" 
                       placeholder="e.g. IGST"
                       className="w-full h-11 px-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans"
                     />
                     <span className="text-[10px] text-gray-400 font-medium tracking-tight">Naming convention for internal reference.</span>
                  </div>

                  <div className="flex flex-col gap-3">
                     <label className="text-[11px] uppercase font-bold text-gray-500">Tax Type *</label>
                     <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center gap-3 p-4 rounded-btn border border-plano-500 bg-plano-50 text-plano-700">
                           <div className="w-2.5 h-2.5 rounded-full bg-plano-600 ring-4 ring-plano-100" />
                           <span className="text-xs font-bold uppercase tracking-widest">Percentage</span>
                        </button>
                        <button className="flex items-center gap-3 p-4 rounded-btn border border-border bg-white text-gray-400 hover:border-gray-300">
                           <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />
                           <span className="text-xs font-bold uppercase tracking-widest">Fixed Amount</span>
                        </button>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <label className="text-[11px] uppercase font-bold text-gray-500">Rate (Percentage Value) *</label>
                     <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="w-full h-11 px-4 pr-10 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">%</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <label className="text-[11px] uppercase font-bold text-gray-500">Tax Description</label>
                     <textarea 
                        rows={3}
                        placeholder="Explain application rules..."
                        className="w-full p-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans resize-none"
                     />
                  </div>

                  <div className="p-4 rounded-btn bg-gray-50 border border-border flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shrink-0">
                        <HelpCircle size={14} className="text-gray-400" />
                     </div>
                     <p className="text-[10px] text-gray-500 leading-normal">
                        <strong>Important:</strong> Tax rules are applied to Invoice line items. Ensure rates are correct for your operational region.
                     </p>
                  </div>
               </div>

               <div className="p-6 border-t border-border flex items-center justify-between gap-4 bg-gray-50/50">
                  <button onClick={() => setShowDrawer(false)} className="flex-1 h-11 rounded-btn border border-border bg-white text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-50 transition-all">
                     Discard
                  </button>
                  <button className="flex-[2] h-11 rounded-btn bg-plano-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-plano-700 transition-all shadow-md">
                     Create Tax Rule
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
