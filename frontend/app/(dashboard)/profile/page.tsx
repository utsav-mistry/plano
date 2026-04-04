'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Clock, 
  Camera, 
  Save, 
  Key, 
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    setIsSubmitting(true);
    try {
      const res = await api.users.update(user._id, form);
      if (res.success) {
        success('Profile Updated', 'Your personal information has been synchronized.');
      }
    } catch (err: any) {
      toastError('Update Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-2 block";
  const inputStyle = "w-full h-12 px-4 rounded-xl border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-semibold text-text-primary shadow-sm";

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-4xl mx-auto">
      {/* Header with Background Accent */}
      <div className="relative h-48 w-full rounded-[2rem] bg-plano-900 overflow-hidden shadow-2xl flex items-end p-8 border border-white/5 group">
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-plano-600/20 to-transparent pointer-events-none"></div>
         <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-plano-500 rounded-full blur-[100px] opacity-20"></div>
         
         <div className="flex items-center gap-6 z-10">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-white text-plano-900 border-[6px] border-plano-800 shadow-xl flex items-center justify-center text-3xl font-serif font-bold uppercase overflow-hidden">
                {user?.name?.charAt(0) || 'U'}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                   <Camera size={24} className="text-white" />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-success-500 border-4 border-plano-900"></div>
            </div>
            
            <div className="flex flex-col text-white">
               <h1 className="text-3xl font-serif">{user?.name || 'Authorized User'}</h1>
               <div className="flex items-center gap-2 mt-1">
                 <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest border border-white/5">
                   {user?.role || 'Admin'}
                 </span>
                 <span className="h-4 w-px bg-white/10"></span>
                 <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                   Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                 </span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           <section className="bg-white p-6 rounded-card border border-border shadow-sm flex flex-col gap-6">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                 <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-plano-50 text-plano-700 text-xs font-bold uppercase tracking-widest hover:bg-plano-100 transition-all">
                    <Key size={16} /> Security Settings
                 </button>
                 <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all">
                    <Shield size={16} /> Data Privacy
                 </button>
                 <button 
                   onClick={logout}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger-50 text-danger-600 text-xs font-bold uppercase tracking-widest hover:bg-danger-100 transition-all mt-4"
                 >
                    <LogOut size={16} /> Sign out
                 </button>
              </div>
           </section>

           <div className="bg-info-50/50 p-6 rounded-card border border-info-100 flex items-start gap-4 shadow-sm">
              <Clock size={20} className="text-info-500 shrink-0 mt-1" />
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-bold text-info-700 uppercase tracking-widest">System Status</span>
                 <p className="text-[10px] text-info-600 font-medium leading-relaxed">
                   Your account session is active and secure. Last identity check was {new Date().toLocaleTimeString()}.
                 </p>
              </div>
           </div>
        </div>

        {/* Main Profile Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <form onSubmit={handleUpdateProfile} className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
               <div className="w-10 h-10 rounded-xl bg-plano-50 text-plano-600 flex items-center justify-center border border-plano-100 shadow-sm">
                 <User size={20} />
               </div>
               <h2 className="text-2xl font-serif font-bold text-text-primary">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col">
                  <label className={labelStyle}>Full Display Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      suppressHydrationWarning
                      required
                      type="text" 
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className={cn(inputStyle, "pl-11")}
                    />
                  </div>
               </div>
               <div className="flex flex-col">
                  <label className={labelStyle}>System Identifier</label>
                  <input 
                    disabled
                    type="text" 
                    value={user?._id || 'UID-0000'}
                    className={cn(inputStyle, "bg-gray-100 cursor-not-allowed font-mono text-[10px] opacity-60")}
                  />
               </div>
            </div>

            <div className="flex flex-col">
               <label className={labelStyle}>Primary Contact Email</label>
               <div className="relative">
                 <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                   suppressHydrationWarning
                   required
                   type="email" 
                   value={form.email}
                   onChange={(e) => setForm({...form, email: e.target.value})}
                   className={cn(inputStyle, "pl-11")}
                 />
               </div>
               <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 ml-1">
                 <Shield size={10} className="text-success-500" /> This account is linked to your enterprise directory.
               </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
               <button 
                 type="submit"
                 disabled={isSubmitting}
                 className="flex-1 h-14 rounded-xl bg-plano-600 text-white text-lg font-bold hover:bg-black transition-all shadow-xl hover:shadow-2xl disabled:opacity-60 flex items-center justify-center gap-3 decoration-none border-0"
               >
                 {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                 {isSubmitting ? 'Syncing Profile...' : 'Update Profile Information'}
               </button>
            </div>
          </form>

          {/* Security Summary Section */}
          <section className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-6">
             <div className="flex items-center gap-3">
               <Shield size={20} className="text-success-600" />
               <h2 className="text-xl font-serif font-bold text-text-primary">Security & Identity</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {[
                  { label: 'Role Authority', value: user?.role, icon: <Shield size={14} className="text-plano-600" /> },
                  { label: 'Login Status', value: 'Verified', icon: <CheckCircle2 size={14} className="text-success-600" /> },
                  { label: '2FA Auth', value: 'Not Active', icon: <AlertCircle size={14} className="text-danger-500" /> },
                  { label: 'Encryption', value: 'AES-256 SSL', icon: <Shield size={14} className="text-info-600" /> },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-border flex items-center justify-between group hover:border-plano-200 transition-all">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       {item.icon}
                       {item.label}
                     </span>
                     <span className="text-xs font-bold text-text-primary uppercase tracking-widest">{item.value || 'N/A'}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
