'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, Printer, ShoppingBag, ArrowRight, Package, 
  Sparkles, Star, ShieldCheck, Mail, ArrowLeft, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'S001';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
       window.print();
    }
  };

  if (!isClient) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      {/* Decorative Fireworks / Sparkles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-plano-400 opacity-10 blur-3xl animate-pulse rounded-full" />
         <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-plano-200 opacity-10 blur-3xl animate-pulse rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative z-10"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-success-50 border border-success-100 flex items-center justify-center text-success-600 mx-auto mb-10 shadow-2xl shadow-success-600/10 rotate-3">
           <CheckCircle2 size={48} strokeWidth={1} />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-plano-900 uppercase tracking-tighter leading-none mb-6">
           Thanks you for your order
        </h1>
        
        <div className="flex flex-col items-center gap-2 mb-12">
           <div className="px-6 py-2 rounded-2xl bg-white border border-plano-100 shadow-sm flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</span>
              <span className="text-sm font-bold text-plano-900 font-mono tracking-widest">{orderId}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
           </div>
           <p className="text-gray-500 font-medium">Your payment has been processed. We've sent a detailed receipt to your email.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
           {[
             { icon: Package, title: 'Instant Activation', desc: 'Check your portal' },
             { icon: Mail, title: 'Email Receipt', desc: 'Sent to your inbox' },
             { icon: Star, title: 'Loyalty Points', desc: '120 Plano Points' }
           ].map((feature, i) => (
             <div key={i} className="p-6 rounded-[2rem] bg-white border border-plano-50 flex flex-col items-center gap-3 shadow-sm hover:border-plano-200 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-plano-50 flex items-center justify-center text-plano-600 group-hover:scale-110 transition-transform">
                   <feature.icon size={20} />
                </div>
                <div>
                   <h4 className="text-xs font-bold text-plano-900 uppercase tracking-widest mb-1">{feature.title}</h4>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{feature.desc}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link href="/portal" className="h-14 px-10 rounded-2xl bg-plano-600 text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-plano-900 shadow-xl shadow-plano-600/20 active:scale-95 group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Return Home
           </Link>
           <button 
             onClick={handlePrint}
             className="h-14 px-10 rounded-2xl border border-plano-200 bg-white text-plano-900 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:border-plano-600 hover:text-plano-600 hover:shadow-md"
           >
              <Printer size={18} />
              Print Receipt
           </button>
        </div>
      </motion.div>

      {/* Decorative footer text */}
      <div className="mt-24 pt-8 border-t border-plano-50 opacity-10 flex flex-col items-center gap-2 pointer-events-none select-none">
         <Sparkles size={32} className="text-plano-600 mb-4" />
         <span className="text-[5px] uppercase tracking-widest leading-none">PLANO • PLR • PORTAL • PLR • PLANO • PLR • PORTAL</span>
         <span className="text-[5px] uppercase tracking-widest leading-none">PLANO • PLR • PORTAL • PLR • PLANO • PLR • PORTAL</span>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-plano-600" size={32} /></div>}>
       <OrderConfirmationContent />
    </Suspense>
  );
}
