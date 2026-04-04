'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ShoppingBag, Package, User, Calculator, ArrowRight, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(o => !o);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      fetchProducts();
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.products.getAll();
      if (res.success) {
        const data = res.data as any;
        setProducts(Array.isArray(data) ? data : (data?.products || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleSelect = (productId: string) => {
    router.push(`/portal/shop/${productId}`);
    setIsOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(i => Math.min(i + 1, filteredProducts.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredProducts[selectedIndex]) {
      handleSelect(filteredProducts[selectedIndex]._id || filteredProducts[selectedIndex].id);
    }
  };

  return (
    <>
      {/* Trigger Button (Invisible if you want just Ctrl+K, but better to have it) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 h-10 border border-plano-100 rounded-full bg-plano-50/50 text-gray-400 hover:border-plano-300 hover:bg-white transition-all group"
      >
        <Search size={16} className="group-hover:text-plano-600 transition-colors" />
        <span className="text-xs font-bold uppercase tracking-widest">Quick Search...</span>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-plano-100 shadow-sm">
           <Command size={10} strokeWidth={3} />
           <span className="text-[10px] font-bold">K</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-6">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-plano-900/40 backdrop-blur-md"
               onClick={() => setIsOpen(false)}
             />
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: -20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: -20 }}
               className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-plano-100 overflow-hidden relative z-10"
             >
                <div className="flex items-center gap-4 px-6 h-20 border-b border-plano-50">
                   <Search size={24} className="text-plano-600" />
                   <input 
                     ref={inputRef}
                     type="text"
                     placeholder="Search products, services, or documentation..."
                     value={query}
                     onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                     onKeyDown={onKeyDown}
                     className="flex-1 h-full bg-transparent outline-none text-lg font-bold text-plano-900 placeholder:text-gray-300 placeholder:font-medium"
                   />
                   <div className="p-2 rounded-xl bg-plano-50 text-gray-400">
                      <X size={18} className="cursor-pointer hover:text-plano-600 transition-colors" onClick={() => setIsOpen(false)} />
                   </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                   {isLoading ? (
                     <div className="py-12 flex flex-col items-center gap-4 text-gray-400">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-xs font-bold uppercase tracking-widest">Searching Ecosystem...</span>
                     </div>
                   ) : filteredProducts.length > 0 ? (
                     <div className="space-y-1">
                        <div className="px-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Product Matches</div>
                        {filteredProducts.map((p, i) => (
                           <button 
                             key={p.id}
                             onClick={() => handleSelect(p._id || p.id)}
                             onMouseEnter={() => setSelectedIndex(i)}
                             className={cn(
                               "w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all group",
                               selectedIndex === i ? "bg-plano-600 text-white shadow-xl shadow-plano-600/20 translate-x-2" : "hover:bg-plano-50"
                             )}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                   selectedIndex === i ? "bg-white/20" : "bg-plano-50 text-plano-600"
                                 )}>
                                    <ShoppingBag size={20} />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-bold uppercase tracking-tight">{p.name}</h4>
                                    <p className={cn("text-xs line-clamp-1", selectedIndex === i ? "text-white/70" : "text-gray-400")}>{p.description}</p>
                                 </div>
                              </div>
                              <ArrowRight size={18} className={cn("transition-transform", selectedIndex === i ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4")} />
                           </button>
                        ))}
                     </div>
                   ) : query ? (
                     <div className="py-12 text-center">
                        <Package size={48} className="mx-auto text-plano-50 mb-4" strokeWidth={1} />
                        <h3 className="text-lg font-bold text-plano-900 uppercase">No results found</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Try searching for something else</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl border border-plano-50 space-y-4">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-plano-600 uppercase tracking-widest">
                               <Sparkles size={14} />
                               Popular Links
                           </div>
                           <div className="space-y-3">
                              {[
                                { l: 'Browse Shop', h: '/portal/shop', i: ShoppingBag },
                                { l: 'My Orders', h: '/portal/account/orders', i: Package },
                                { l: 'User Settings', h: '/portal/account/profile', i: User }
                              ].map(link => (
                                <button key={link.l} onClick={() => { router.push(link.h); setIsOpen(false); }} className="flex items-center gap-3 w-full text-left text-sm font-bold text-gray-500 hover:text-plano-600 transition-colors uppercase tracking-tight">
                                   <link.i size={16} />
                                   {link.l}
                                </button>
                              ))}
                           </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-plano-50/50 border border-plano-100 flex flex-col justify-center">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-plano-600 uppercase tracking-widest mb-4">
                               <Calculator size={14} />
                               Billing Tip
                           </div>
                           <p className="text-xs font-medium text-gray-500 italic leading-relaxed uppercase tracking-widest">Use the search to jump directly to any plan details. Type "Enterprise" for bulk license info.</p>
                        </div>
                     </div>
                   )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-plano-50 flex items-center justify-between">
                   <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-white border border-plano-100 text-[10px] text-plano-900 shadow-sm select-none">⏎</span> Select</div>
                      <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-white border border-plano-100 text-[10px] text-plano-900 shadow-sm select-none">↑↓</span> Navigate</div>
                      <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-white border border-plano-100 text-[10px] text-plano-900 shadow-sm select-none">ESC</span> Close</div>
                   </div>
                   <span className="text-[10px] font-bold text-plano-300 uppercase tracking-widest select-none">Plano Gateway Search</span>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
