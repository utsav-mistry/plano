'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, ShieldCheck,
  Loader2, Save, Package, CreditCard, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const profileUser = user as (UserType & { phone?: string; address?: string }) | undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (profileUser) {
      setForm({
        name: profileUser.name || '',
        email: profileUser.email || '',
        phone: profileUser.phone || '',
        address: profileUser.address || ''
      });
    }
  }, [profileUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id || user?._id;
    if (!userId) {
      toastError('Update Failed', 'Session user id is missing. Please login again.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.users.update(userId, {
        name: form.name,
        phone: form.phone,
        address: form.address,
      });
      if (res.success) {
        toastSuccess('Profile Updated', 'Your details have been saved successfully.');
        const responseData = res.data as Partial<UserType> & { user?: UserType };
        const updatedUser = (responseData.user ?? responseData) as UserType;
        if (updatedUser) {
          localStorage.setItem('plano_user', JSON.stringify({
            ...user,
            ...updatedUser,
            id: updatedUser.id || updatedUser._id || userId,
          }));
        }
      }
    } catch (err: unknown) {
      toastError('Update Failed', err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-6 text-center flex-shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plano-50 border border-plano-100 text-plano-600 text-[9px] font-bold uppercase tracking-widest mb-2 shadow-sm">
          <User size={12} />
          My Account
        </div>
        <h1 className="text-xl font-bold text-plano-900 uppercase tracking-tight mb-1">Personal Details</h1>
        <p className="text-gray-400 text-xs font-medium italic">Manage your contact information and billing details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-1.5 h-fit">
          {[
            { label: 'Profile Settings', href: '/portal/account/profile', icon: User, active: true },
            { label: 'My Subscriptions', href: '/portal/account/orders', icon: Package },
            { label: 'Payment Methods', href: '#', icon: CreditCard, disabled: true }
          ].map((link, i) => (
            <a
              key={i}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                link.active ? "bg-plano-600 text-white shadow-md shadow-plano-600/10" :
                  link.disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-plano-600 hover:bg-plano-50"
              )}
            >
              <link.icon size={16} />
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-3">
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-[2rem] border border-plano-100 p-6 md:p-8 shadow-xl shadow-plano-600/5 relative overflow-hidden"
          >
            {/* Aesthetic Sparkle */}
            <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
              <Sparkles size={48} className="text-plano-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-plano-50 bg-plano-50/20 text-xs font-bold text-plano-900 outline-none focus:border-plano-600 focus:bg-white transition-all shadow-sm"
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-plano-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full h-10 px-10 rounded-xl border border-plano-50 bg-gray-50/50 text-xs font-bold text-gray-400 outline-none cursor-not-allowed"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <ShieldCheck size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-success-500" />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                <div className="relative group">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-plano-50 bg-plano-50/20 text-xs font-bold text-plano-900 outline-none focus:border-plano-600 focus:bg-white transition-all shadow-sm"
                  />
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-plano-600" />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Billing Address</label>
                <div className="relative group">
                  <textarea
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full p-4 pl-10 h-20 rounded-xl border border-plano-50 bg-plano-50/20 text-xs font-bold text-plano-900 outline-none focus:border-plano-600 focus:bg-white transition-all shadow-sm resize-none"
                  />
                  <MapPin size={16} className="absolute left-3.5 top-4 text-gray-300 transition-colors group-focus-within:text-plano-600" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-plano-50">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-10 px-8 rounded-xl bg-plano-600 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-plano-900 shadow-md active:scale-95 group"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <Save size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    Save Changes
                  </>
                )}
              </button>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-success-600" />
                Data encrypted
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
