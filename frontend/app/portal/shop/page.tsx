'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Loader2, Sparkles, Plus, Layers, FilterX, X, FileCheck, ArrowRight, CreditCard, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/app/context/AuthContext';
import { useCartStore } from '@/store/cartStore';

export default function ShopPage() {
   const router = useRouter();
   const { user } = useAuth();
   const { success: toastSuccess, error: toastError } = useToast();
   const addItem = useCartStore((s) => s.addItem);
   const [products, setProducts] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [search, setSearch] = useState('');
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
   const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
   const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');
   const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
   const [checkoutQty, setCheckoutQty] = useState(1);
   const [isPaying, setIsPaying] = useState(false);

   const getDisplayPriceInfo = (product: Product) => {
      if (product.plans && product.plans.length > 0) {
         const sorted = [...product.plans].sort((a, b) => a.price - b.price);
         const lowest = sorted[0];
         return {
            price: Number(lowest.price || 0),
            label: lowest.billingCycle === 'monthly' ? 'month' : lowest.billingCycle === 'yearly' ? 'year' : lowest.name,
         };
      }

      return {
         price: Number(product.basePrice || 0),
         label: product.unitLabel || 'unit',
      };
   };

   const getProductId = (product: Product) => product.id || product._id || '';

   const getFirstPlanRef = (product: Product) => {
      if (!product.plans || product.plans.length === 0) return null;
      const first = product.plans[0] as any;
      if (!first) return null;
      return {
         id: first.id || first._id || `plan-${getProductId(product)}`,
         name: first.name || `${product.name} Plan`,
      };
   };

   useEffect(() => {
      async function fetchProducts() {
         try {
            const res = await api.products.getAll();
            if (res.success) {
               // Handle both direct array and paginated object responses
               const rawData = res.data as any;
               const productsList = Array.isArray(rawData) ? rawData : (rawData?.products || []);
               setProducts(productsList);
            }
         } catch (err) {
            console.error('Failed to fetch products', err);
         } finally {
            setIsLoading(false);
         }
      }
      fetchProducts();
   }, []);

   const categories = useMemo(() => {
      if (!Array.isArray(products)) return ['All'];
      const cats = Array.from(new Set(products.map(p => p.type))).filter(Boolean);
      return ['All', ...cats];
   }, [products]);

   const filteredProducts = useMemo(() => {
      if (!Array.isArray(products)) return [];
      return products
         .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
               (p.description?.toLowerCase().includes(search.toLowerCase()) || false);
            const matchesCategory = !selectedCategory || selectedCategory === 'All' || p.type === selectedCategory;

            const base = getDisplayPriceInfo(p).price;
            const matchesPrice = base >= priceRange[0] && base <= priceRange[1];

            return matchesSearch && matchesCategory && matchesPrice;
         })
         .sort((a, b) => {
            if (sortBy === 'price-asc') {
               return getDisplayPriceInfo(a).price - getDisplayPriceInfo(b).price;
            }
            if (sortBy === 'price-desc') {
               return getDisplayPriceInfo(b).price - getDisplayPriceInfo(a).price;
            }
            return 0; // Default to natural/unsorted
         });
   }, [products, search, selectedCategory, priceRange, sortBy]);

   const selectedProductPriceInfo = selectedProduct ? getDisplayPriceInfo(selectedProduct) : { price: 0, label: 'unit' };
   const selectedProductTotal = selectedProductPriceInfo.price * checkoutQty;

   function openProductCheckout(product: Product) {
      setSelectedProduct(product);
      setCheckoutQty(1);
   }

   function closeProductCheckoutModal() {
      if (isPaying) return;
      setSelectedProduct(null);
      setCheckoutQty(1);
   }

   function handleAddSelectedProductToCart() {
      if (!selectedProduct) return;

      const productId = getProductId(selectedProduct);
      if (!productId) {
         toastError('Unable to add', 'This product is missing an identifier. Please refresh and try again.');
         return;
      }

      const pricing = getDisplayPriceInfo(selectedProduct);
      if (pricing.price <= 0) {
         toastError('Invalid amount', 'This product has no payable amount yet.');
         return;
      }

      const planRef = getFirstPlanRef(selectedProduct);
      const planId = planRef?.id || `base-${productId}`;
      const planLabel = planRef?.name || `${selectedProduct.name} Base`;

      addItem({
         id: '',
         productId,
         name: selectedProduct.name,
         planId,
         planLabel,
         billingPeriod: pricing.label,
         price: pricing.price,
         quantity: checkoutQty,
         image: '',
      });

      toastSuccess('Added to Cart', `${selectedProduct.name} (${planLabel}) added successfully.`);
      setSelectedProduct(null);
      setCheckoutQty(1);
   }

   function handleRazorpayCheckout() {
      if (!selectedProduct) return;
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
         toastError('Razorpay unavailable', 'Payment SDK not loaded yet. Please try again in a moment.');
         return;
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
         toastError('Razorpay key missing', 'Set NEXT_PUBLIC_RAZORPAY_KEY_ID in frontend environment.');
         return;
      }

      setIsPaying(true);

      const options = {
         key: razorpayKey,
         amount: Math.round(selectedProductTotal * 100),
         currency: 'INR',
         name: 'Plano Subscriptions',
         description: `${selectedProduct.name} (${checkoutQty} x ${selectedProductPriceInfo.label})`,
         image: 'https://cdn.razorpay.com/logos/H6U6f9bA6G6E7M_medium.png',
         prefill: {
            name: user?.name,
            email: user?.email,
         },
         theme: { color: '#8f5580' },
         handler: (response: any) => {
            setIsPaying(false);
            setSelectedProduct(null);
            setCheckoutQty(1);
            toastSuccess('Payment Captured', `Transaction ID: ${response.razorpay_payment_id}`);
            router.push(`/portal/order/confirmation?id=S100${Math.floor(Math.random() * 1000)}&ref=${response.razorpay_payment_id}`);
         },
         modal: {
            ondismiss: () => setIsPaying(false),
         },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
   }

   if (isLoading) {
      return (
         <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-plano-600" size={32} />
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto px-6 pt-4 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
         {/* Page Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 flex-shrink-0">
            <div className="max-w-xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plano-50 border border-plano-100 text-plano-600 text-[9px] font-bold uppercase tracking-widest mb-2 shadow-sm">
                  <Sparkles size={12} />
                  Portal Ecosystem
               </div>
               <h1 className="text-2xl font-bold text-plano-900 uppercase tracking-tighter mb-1 leading-none italic">Product Catalog</h1>
               <p className="text-gray-400 text-xs font-medium leading-tight">Manage our full catalog of software tools and services. Use variants to customize pricing.</p>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative group flex-1 md:w-56">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                     type="text"
                     placeholder="Search catalog..."
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="h-10 w-full pl-11 pr-4 rounded-xl bg-white border border-plano-100 text-xs font-bold text-plano-900 outline-none focus:border-plano-600 transition-all uppercase tracking-widest placeholder:text-[9px] shadow-sm"
                  />
               </div>
               <button className="h-10 w-10 rounded-xl bg-white border border-plano-100 flex items-center justify-center text-gray-400 hover:text-plano-600 shadow-sm">
                  <SlidersHorizontal size={16} />
               </button>
            </div>
         </div>

         {/* Main Layout Area */}
         <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-hide no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-8">

               {/* Sidebar Filters */}
               <div className="lg:col-span-1 space-y-6">
                  {/* Categories */}
                  <div>
                     <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3 italic border-l-2 border-plano-100">Collections</h3>
                     <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                        {categories.map(cat => (
                           <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
                              className={cn(
                                 "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-left transition-all border",
                                 (cat === 'All' && !selectedCategory) || selectedCategory === cat ? "bg-plano-600 text-white border-plano-600 shadow-md" : "bg-white text-gray-400 border-plano-50 hover:border-plano-200"
                              )}
                           >
                              {cat}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Price Range */}
                  <div className="p-4 bg-white rounded-2xl border border-plano-50 shadow-sm">
                     <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between italic">
                        Budget
                        <span className="text-plano-600 font-mono">₹{priceRange[1]}</span>
                     </h3>
                     <input
                        type="range"
                        min="0"
                        max="150000"
                        step="5000"
                        value={priceRange[1]}
                        onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full accent-plano-600 h-1 bg-plano-50 rounded-full appearance-none cursor-pointer"
                     />
                  </div>

                  {/* Professional Templates (Module 10) */}
                  <div className="p-5 bg-plano-900 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-plano-600/10">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-plano-600 opacity-20 blur-2xl rounded-full" />
                     <h3 className="text-[10px] font-bold text-plano-300 uppercase tracking-widest mb-4 flex items-center gap-2 italic relative z-10">
                        <Sparkles size={14} />
                        Starter Bundles
                     </h3>
                     <div className="space-y-4 relative z-10">
                        {[
                           { id: 't1', name: 'Elite SaaS Stack', price: 12500, items: 3 },
                           { id: 't2', name: 'Starter Micro-Ops', price: 4200, items: 2 },
                        ].map(template => (
                           <button
                              key={template.id}
                              onClick={() => {
                                 setSelectedBundle({
                                    ...template,
                                    description: template.id === 't1'
                                       ? 'Complete infrastructure setup including Cloud CRM, API Gateway, and Priority support.'
                                       : 'Lightweight setup for small teams. Includes Core Platform & Analytics Lite.'
                                 });
                              }}
                              className="w-full text-left bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/10 transition-all group"
                           >
                              <p className="text-sm font-bold font-caveat text-white text-lg leading-tight mb-1">{template.name}</p>
                              <div className="flex items-center justify-between">
                                 <span className="text-[9px] font-bold text-plano-400 uppercase tracking-widest">{template.items} Products</span>
                                 <span className="text-xs font-bold text-plano-400 group-hover:text-white transition-colors">₹{template.price.toLocaleString()}</span>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Sorting */}
                  <div className="p-4 bg-plano-50/30 rounded-2xl border border-plano-50">
                     <div className="flex items-center gap-2 mb-3">
                        <ArrowUpDown size={14} className="text-plano-600" />
                        <span className="text-[10px] font-bold text-plano-900 uppercase tracking-widest">Global Order</span>
                     </div>
                     <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="w-full bg-transparent text-[10px] font-bold text-gray-500 outline-none uppercase tracking-widest"
                     >
                        <option value="newest">Featured First</option>
                        <option value="price-asc">Price Low-High</option>
                        <option value="price-desc">Price High-Low</option>
                     </select>
                  </div>
               </div>

               {/* Product Grid */}
               <div className="lg:col-span-3">
                  <AnimatePresence mode="popLayout">
                     {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                           {filteredProducts.map((p, i) => {
                              const { price, label } = getDisplayPriceInfo(p);
                              return (
                                 <motion.div
                                    key={p.id || p._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                 >
                                    <button
                                       onClick={() => openProductCheckout(p)}
                                       className="group block w-full text-left bg-white rounded-[2.5rem] border border-plano-50 p-6 transition-all hover:border-plano-600 hover:shadow-2xl hover:shadow-plano-600/5 hover:-translate-y-2"
                                    >
                                       <div className="aspect-square rounded-3xl bg-plano-50 mb-6 flex items-center justify-center text-plano-200 group-hover:scale-105 group-hover:bg-plano-100 transition-all overflow-hidden relative">
                                          <Layers size={64} strokeWidth={1} className={cn("transition-transform duration-700", i % 2 === 0 ? "group-hover:rotate-12" : "group-hover:-rotate-12")} />
                                          <div className="absolute top-4 right-4 h-7 px-3 rounded-xl bg-white border border-plano-50 text-[10px] font-bold uppercase tracking-widest text-plano-600 flex items-center shadow-sm">
                                             {p.type}
                                          </div>
                                       </div>

                                       <div className="flex flex-col h-fit">
                                          <h3 className="text-lg font-bold text-plano-900 uppercase leading-none mb-2">{p.name}</h3>
                                          <p className="text-xs font-medium text-gray-400 line-clamp-2 leading-relaxed h-10 mb-6">{p.description}</p>
                                          <div className="pt-6 border-t border-plano-50 flex items-center justify-between">
                                             <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Starts from</div>
                                                <div className="text-2xl font-bold text-plano-900 tabular-nums font-mono">₹{price.toLocaleString()}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">per {label}</div>
                                             </div>
                                             <div className="w-12 h-12 rounded-2xl bg-plano-50 flex items-center justify-center text-plano-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">
                                                <Plus size={24} />
                                             </div>
                                          </div>
                                       </div>
                                    </button>
                                 </motion.div>
                              );
                           })}
                        </div>
                     ) : (
                        <div className="py-32 text-center">
                           <div className="w-20 h-20 rounded-3xl bg-plano-50 flex items-center justify-center text-gray-200 mx-auto mb-8 shadow-inner">
                              <FilterX size={40} />
                           </div>
                           <h3 className="text-xl font-bold text-plano-900 uppercase">No products discovered</h3>
                           <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-4">Adjust your parameters or try a clear search to find more packages.</p>
                           <button
                              onClick={() => {
                                 setSearch('');
                                 setSelectedCategory(null);
                                 setPriceRange([0, 150000]);
                              }}
                              className="mt-8 h-12 px-8 rounded-2xl bg-white border border-plano-200 text-plano-900 text-xs font-bold uppercase tracking-widest hover:border-plano-600 hover:text-plano-600 transition-all"
                           >
                              Reset Filters
                           </button>
                        </div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>
         {/* Bundle Selection Modal */}
         <AnimatePresence>
            {selectedBundle && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 bg-plano-900/60 backdrop-blur-md"
                     onClick={() => setSelectedBundle(null)}
                  />

                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 border border-white/20"
                  >
                     {/* Purple Header Accent */}
                     <div className="bg-plano-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-plano-600 opacity-20 blur-3xl rounded-full" />
                        <div className="relative z-10">
                           <div className="flex items-center justify-between mb-6">
                              <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-plano-200">
                                 Starter Bundle System
                              </div>
                              <button
                                 onClick={() => setSelectedBundle(null)}
                                 className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                              >
                                 <X size={14} />
                              </button>
                           </div>
                           <h2 className="text-4xl font-bold font-caveat mb-2">{selectedBundle.name}</h2>
                           <p className="text-white/60 text-xs font-medium uppercase tracking-widest italic">{selectedBundle.items} Integrated Services Optimized</p>
                        </div>
                     </div>

                     <div className="p-8">
                        <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8 uppercase tracking-tighter">
                           {selectedBundle.description}
                        </p>

                        <div className="space-y-4 mb-8">
                           <div className="flex items-center justify-between p-4 rounded-2xl border border-plano-50 bg-plano-50/10">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-white border border-plano-50 flex items-center justify-center text-plano-600">
                                    <FileCheck size={16} />
                                 </div>
                                 <span className="text-[10px] font-bold text-plano-900 uppercase">Pre-Approved Quotation</span>
                              </div>
                              <span className="text-xs font-bold text-success-600 uppercase tracking-widest">VALIDATED</span>
                           </div>
                           <div className="flex items-center justify-between p-4 rounded-2xl border border-plano-50">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Est. Monthly Total</span>
                              <span className="text-2xl font-bold text-plano-900 tabular-nums">₹{selectedBundle.price.toLocaleString()}</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => setSelectedBundle(null)}
                              className="flex-1 h-16 rounded-2xl border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-widest hover:bg-plano-50 transition-all"
                           >
                              I'll decide later
                           </button>
                           <button
                              onClick={() => {
                                 // Simulate adding bundle items to cart
                                 router.push('/portal/cart');
                              }}
                              className="flex-[2] h-16 rounded-2xl bg-plano-900 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-plano-600 transition-all shadow-xl shadow-plano-600/20 active:scale-95 px-6 group"
                           >
                              Initialize Bundle
                              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Product Checkout Modal */}
         <AnimatePresence>
            {selectedProduct && (
               <div className="fixed inset-0 z-[220] flex items-center justify-center p-6">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="absolute inset-0 bg-plano-900/60 backdrop-blur-md"
                     onClick={closeProductCheckoutModal}
                  />

                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     transition={{ duration: 0.2 }}
                     className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative z-10 border border-white/20"
                  >
                     <div className="bg-plano-900 p-7 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-plano-600 opacity-20 blur-3xl rounded-full" />
                        <div className="relative z-10 flex items-start justify-between gap-4">
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-plano-200">Razorpay Checkout</p>
                              <h2 className="text-2xl font-bold mt-2">{selectedProduct.name}</h2>
                              <p className="text-xs text-white/70 mt-1 uppercase tracking-widest">{selectedProduct.type}</p>
                           </div>
                           <button
                              disabled={isPaying}
                              onClick={closeProductCheckoutModal}
                              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50"
                           >
                              <X size={14} />
                           </button>
                        </div>
                     </div>

                     <div className="p-7">
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6 uppercase tracking-tight">
                           {selectedProduct.description || 'Secure online payment with Razorpay only for portal checkout.'}
                        </p>

                        <div className="rounded-2xl border border-plano-50 bg-plano-50/10 p-4 mb-6">
                           <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Price</span>
                              <span className="text-sm font-bold text-plano-900">₹{selectedProductPriceInfo.price.toLocaleString()} / {selectedProductPriceInfo.label}</span>
                           </div>

                           <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</span>
                              <div className="h-10 px-3 bg-white border border-plano-100 rounded-xl flex items-center gap-4">
                                 <button disabled={isPaying} onClick={() => setCheckoutQty((q) => Math.max(1, q - 1))} className="text-gray-400 hover:text-plano-900 disabled:opacity-50"><Minus size={14} /></button>
                                 <span className="w-4 text-center text-xs font-bold text-plano-900">{checkoutQty}</span>
                                 <button disabled={isPaying} onClick={() => setCheckoutQty((q) => q + 1)} className="text-gray-400 hover:text-plano-900 disabled:opacity-50"><Plus size={14} /></button>
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-3 border-t border-plano-100">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Payable</span>
                              <span className="text-2xl font-bold text-plano-900 tabular-nums">₹{selectedProductTotal.toLocaleString()}</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <button
                              onClick={handleAddSelectedProductToCart}
                              disabled={isPaying}
                              className="flex-1 h-14 rounded-2xl border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-widest hover:bg-plano-50 transition-all disabled:opacity-60"
                           >
                              Add to Cart
                           </button>
                           <button
                              onClick={handleRazorpayCheckout}
                              disabled={isPaying || selectedProductPriceInfo.price <= 0}
                              className="flex-[2] h-14 rounded-2xl bg-plano-900 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-plano-600 transition-all shadow-xl shadow-plano-600/20 active:scale-95 px-6 group disabled:opacity-60 disabled:cursor-not-allowed"
                           >
                              {isPaying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                              {isPaying ? 'Opening Razorpay...' : 'Pay With Razorpay'}
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
