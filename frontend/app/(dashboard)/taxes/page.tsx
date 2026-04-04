'use client';

import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  HelpCircle,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function TaxesManagementPage() {
  const [taxes, setTaxes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    name: '',
    rate: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  async function fetchTaxes() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.taxes.getAll();
      if (response.success) {
        const data = response.data as any;
        setTaxes(data.taxes ?? data ?? []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tax rules');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.rate) {
      toastError('Validation', 'Name and rate are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.taxes.create({
        ...form,
        rate: Number(form.rate)
      });
      if (res.success) {
        success('Tax rule created!', 'New configuration is now active.');
        setShowDrawer(false);
        setForm({ name: '', rate: '', description: '', isActive: true });
        fetchTaxes();
      }
    } catch (err: any) {
      toastError('Failed to create tax', err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this tax rule?')) return;
    try {
      await api.taxes.delete(id);
      success('Tax rule deleted');
      fetchTaxes();
    } catch (err: any) {
      toastError('Delete failed', err.message);
    }
  }

  const filteredTaxes = taxes.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Tax Rules</h1>
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

      {/* Filter Bar */}
      <div className="bg-bg-surface p-4 rounded-card border border-border mt-2">
        <div className="relative max-w-sm">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search tax rules..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:outline-none transition-all text-sm font-sans"
           />
        </div>
      </div>

      {/* Tax List Table */}
      <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm min-h-[400px] flex flex-col">
         {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
               <Loader2 className="w-8 h-8 text-plano-600 animate-spin" />
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Fiscal Rules...</p>
            </div>
         ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
               <AlertCircle size={32} className="text-danger-500" />
               <p className="text-sm font-bold text-text-primary uppercase">{error}</p>
               <button onClick={fetchTaxes} className="text-xs font-bold text-plano-600 underline uppercase tracking-widest">Retry fetch</button>
            </div>
         ) : filteredTaxes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                <Percent size={32} />
              </div>
              <p className="text-lg font-serif font-bold text-text-primary">No tax rules defined</p>
              <button 
                onClick={() => setShowDrawer(true)}
                className="text-xs font-bold text-plano-600 uppercase tracking-widest hover:underline"
              >
                Create your first rule
              </button>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-border bg-gray-50/50">
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Tax Rule Name</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Rate</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Description</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {filteredTaxes.map((tax) => (
                        <tr key={tax._id} className="group hover:bg-gray-25 transition-colors">
                           <td className="py-5 px-6">
                              <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded bg-plano-50 text-plano-600 flex items-center justify-center border border-plano-100">
                                     <Percent size={14} />
                                  </div>
                                  <span className="text-sm font-bold text-text-primary">{tax.name}</span>
                              </div>
                           </td>
                           <td className="py-5 px-6">
                              <span className="text-lg font-serif font-bold text-text-primary">{tax.rate}%</span>
                           </td>
                           <td className="py-5 px-6">
                              <span className="text-xs text-text-secondary font-medium italic line-clamp-1">
                                {tax.description || 'No description provided'}
                              </span>
                           </td>
                           <td className="py-5 px-6 text-right">
                              <div className="flex items-center justify-end gap-2 px-4 shadow-none">
                                 <button className="p-2 rounded-btn text-gray-400 hover:text-plano-600 hover:bg-plano-50 transition-colors">
                                    <Edit2 size={16} />
                                 </button>
                                 <button 
                                  onClick={() => handleDelete(tax._id)}
                                  className="p-2 rounded-btn text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* Drawer Overlay */}
      {showDrawer && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex justify-end">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
               <div className="p-6 border-b border-border flex items-center justify-between bg-bg-surface">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-serif font-bold text-text-primary leading-tight">Add Tax Rule</h2>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Fiscal Configuration</span>
                  </div>
                  <button type="button" onClick={() => setShowDrawer(false)} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                     <label className="text-[11px] uppercase font-bold text-gray-500 flex items-center gap-1">
                        Tax Name *
                     </label>
                     <input 
                       suppressHydrationWarning
                       required
                       type="text" 
                       placeholder="e.g. GST (Integrated)"
                       value={form.name}
                       onChange={e => setForm({...form, name: e.target.value})}
                       className="w-full h-11 px-4 rounded-lg border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans"
                     />
                     <span className="text-[10px] text-gray-400 font-medium tracking-tight">Display name shown on invoices.</span>
                  </div>

                  <div className="flex flex-col gap-2">
                     <label className="text-[11px] uppercase font-bold text-gray-500">Rate (Percentage Value) *</label>
                     <div className="relative">
                        <input 
                          suppressHydrationWarning
                          required
                          type="number" 
                          step="0.01"
                          placeholder="18.00"
                          value={form.rate}
                          onChange={e => setForm({...form, rate: e.target.value})}
                          className="w-full h-11 px-4 pr-10 rounded-lg border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 font-mono">%</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <label className="text-[11px] uppercase font-bold text-gray-500">Tax Description</label>
                     <textarea 
                        rows={5}
                        placeholder="Define where and how this tax applies..."
                        value={form.description}
                        onChange={e => setForm({...form, description: e.target.value})}
                        className="w-full p-4 rounded-lg border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans resize-none"
                     />
                  </div>

                  <div className="p-5 rounded-xl bg-plano-50/50 border border-plano-100 flex items-start gap-3">
                     <div className="w-10 h-10 rounded-full bg-white border border-plano-100 flex items-center justify-center shrink-0 shadow-sm">
                        <HelpCircle size={18} className="text-plano-600" />
                     </div>
                     <div className="flex flex-col gap-1">
                        <p className="text-[11px] font-bold text-plano-900 uppercase tracking-tight">Standardization Note</p>
                        <p className="text-[10px] text-plano-700 leading-relaxed font-medium">
                          Tax rules are applied globally to invoice calculations. Ensure the rate matches legislative requirements for your business jurisdiction.
                        </p>
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-border flex items-center justify-between gap-4 bg-gray-50/80">
                  <button type="button" onClick={() => setShowDrawer(false)} className="flex-1 h-12 rounded-xl border border-border bg-white text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:bg-gray-100 transition-all shadow-sm">
                     Discard
                  </button>
                  <button 
                    disabled={isSubmitting}
                    className="flex-[2] h-12 rounded-xl bg-plano-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-plano-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                     {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                     {isSubmitting ? 'Processing...' : 'Create Tax Rule'}
                  </button>
               </div>
            </form>
         </div>
      )}
    </div>
  );
}
