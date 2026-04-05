'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Product } from '@/types';

export default function ProductsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: toastError, success } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.products.getAll();
      if (response.success) {
        const data = response.data as { products?: Product[] } | Product[];
        setProducts(Array.isArray(data) ? data : (data.products ?? []));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.products.delete(id);
      success('Product deleted successfully');
      fetchProducts();
    } catch (err: unknown) {
      toastError('Failed to delete product', err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
            Manage your product catalog and pricing strategies.
          </p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-surface p-4 rounded-card border border-sidebar-hover shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-input border border-border dark:border-sidebar-hover bg-gray-25 dark:bg-white/5 focus:border-plano-500 focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-all text-sm font-sans text-text-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-3 h-10 border border-border dark:border-sidebar-hover bg-bg-surface rounded-input text-sm font-semibold text-text-secondary hover:bg-sidebar-hover transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center p-1 bg-gray-100 dark:bg-sidebar-hover rounded-input border border-border dark:border-sidebar-hover">
            <button
              onClick={() => setView('grid')}
              className={cn("p-1.5 rounded-btn transition-all", view === 'grid' ? "bg-bg-elevated text-plano-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn("p-1.5 rounded-btn transition-all", view === 'list' ? "bg-bg-elevated text-plano-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-text-secondary">
          <Loader2 size={24} className="animate-spin text-plano-600" />
          <span className="text-sm font-medium uppercase tracking-widest">Loading products...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <AlertCircle size={32} className="text-danger-500" />
          <p className="text-sm font-bold text-text-primary uppercase">{error}</p>
          <button onClick={fetchProducts} className="text-xs font-bold text-plano-600 underline">Try again</button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300">
            <FileText size={32} />
          </div>
          <p className="text-lg font-serif font-bold text-text-primary">No products found</p>
          <Link href="/products/new" className="text-xs font-bold text-plano-600 uppercase tracking-widest hover:underline">
            Create your first product
          </Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-bg-surface border border-sidebar-hover rounded-card p-5 group hover:shadow-md transition-all flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-plano-50 dark:bg-white/10 text-plano-400 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                    product.isActive ? "bg-success-50 dark:bg-success-900/20 text-success-600" : "bg-gray-100 dark:bg-white/10 text-gray-500"
                  )}>
                    {product.isActive ? 'Active' : 'Archived'}
                  </span>
                  <button className="text-gray-400 hover:text-plano-400 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-sans font-bold text-text-primary leading-snug group-hover:text-plano-400 transition-colors line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider font-mono">{product.sku || 'NO SKU'}</span>
                  <span className="w-1 h-1 rounded-full bg-sidebar-hover"></span>
                  <span className="text-[11px] uppercase font-bold text-plano-400 tracking-widest">{product.type}</span>
                </div>
              </div>

              <div className="mt-2 flex flex-col">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Base Price</span>
                <span className="text-2xl font-serif font-bold text-text-primary">{formatCurrency(product.basePrice || 0, product.currency || 'INR')}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-sidebar-hover flex items-center justify-between">
                <Link href={`/products/${product.id}/edit`} className="text-xs font-bold text-text-secondary hover:text-plano-400 transition-all flex items-center gap-1 uppercase tracking-widest">
                  Edit <Edit2 size={12} />
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-xs font-bold text-danger-500 hover:text-danger-700 transition-all flex items-center gap-1 uppercase tracking-widest"
                >
                  Delete <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-bg-surface border border-sidebar-hover rounded-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-sidebar-hover bg-gray-50/50 dark:bg-white/5">
                  <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Product Name</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Type</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest">SKU</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Base Price</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-center">Status</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sidebar-hover">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="group hover:bg-gray-25 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-plano-50 dark:bg-white/10 text-plano-400 flex items-center justify-center">
                          <Package size={16} />
                        </div>
                        <span className="text-sm font-semibold text-text-primary">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-plano-400 bg-plano-50 dark:bg-white/10 px-2 py-0.5 rounded-full">{product.type}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-text-secondary font-mono">{product.sku || '—'}</td>
                    <td className="py-4 px-6 text-sm font-bold text-text-primary">{formatCurrency(product.basePrice || 0, product.currency || 'INR')}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                        product.isActive ? "bg-success-50 dark:bg-success-900/20 text-success-600" : "bg-gray-100 dark:bg-white/10 text-gray-500"
                      )}>
                        {product.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${product.id}/edit`} className="p-1.5 rounded-btn hover:bg-sidebar-hover text-gray-400 hover:text-plano-400 transition-all">
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 rounded-btn hover:bg-danger-500/10 text-gray-400 hover:text-danger-600 transition-all"
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
        </div>
      )}
    </div>
  );
}
