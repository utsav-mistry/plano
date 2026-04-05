'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles, Loader2, IndianRupee, LayoutGrid, Package, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/lib/api';
import { Product, Subscription } from '@/types';

export default function PortalHomePage() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, subRes] = await Promise.all([
          api.products.getAll(),
          api.subscriptions.getAll()
        ]);

        if (prodRes.success) {
          const data = prodRes.data as { products?: Product[] } | Product[];
          const productList = Array.isArray(data) ? data : (data.products ?? []);
          setFeaturedProducts(productList.slice(0, 3));
        }
        if (subRes.success) {
          const data = subRes.data as { subscriptions?: Subscription[] } | Subscription[];
          setSubscriptions(Array.isArray(data) ? data : (data.subscriptions ?? []));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeCount = subscriptions.filter(s => s.status.toLowerCase() === 'active').length;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-plano-600" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-8 sm:py-10 overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-plano-400 opacity-10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-plano-200 opacity-5 blur-3xl rounded-full translate-x-1/4 translate-y-1/4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plano-50 border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
            <Sparkles size={12} />
            Welcome to the Gateway, {user?.name.split(' ')[0]}
          </div>
          <h1 className="text-5xl md:text-8xl font-bold text-plano-900 leading-[0.9] mb-6 tracking-tighter uppercase italic">
            {activeCount > 0 ? (
              <>
                <span className="font-caveat normal-case">Manage Your</span><br />
                <span className="relative inline-block text-plano-600 font-caveat text-7xl md:text-[7.5rem] normal-case px-4">
                  Ecosystem.
                  <img
                    src="/SVG/red_highlight_bold_05.svg"
                    className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-[60%] -z-10 object-contain opacity-20 brightness-0"
                    alt=""
                  />
                </span>
              </>
            ) : (
              <>
                <span className="font-caveat normal-case">Start Your</span><br />
                <span className="relative inline-block text-plano-900 font-caveat text-7xl md:text-[7.5rem] normal-case px-4">
                  Adventure.
                  <img
                    src="/SVG/red_highlight_bold_05.svg"
                    className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-[60%] -z-10 object-contain opacity-90"
                    alt=""
                  />
                </span>
              </>
            )}
          </h1>
          <p className="text-gray-500 font-medium text-md md:text-xl leading-relaxed max-w-2xl mb-8">
            {activeCount > 0
              ? `You have ${activeCount} active subscriptions running across the Plano network. View real-time analytics or browse new upgrades from the catalog.`
              : "Plano is your centralized hub for software and infrastructure subscription services. Start browsing elite packages specially curated for your team."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
            <Link
              href="/portal/shop"
              className="h-14 px-10 rounded-2xl bg-plano-900 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-plano-600 hover:shadow-2xl hover:-translate-y-1 shadow-lg shadow-plano-600/20 active:scale-95 group"
            >
              <ShoppingBag size={18} />
              Explore Catalog
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {activeCount > 0 && (
              <Link
                href="/portal/account/orders"
                className="h-14 px-10 rounded-2xl border border-plano-200 bg-white text-plano-900 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:border-plano-600 hover:text-plano-600 hover:shadow-md"
              >
                My Dashboard
              </Link>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
}
