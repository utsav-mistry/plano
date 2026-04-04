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
  Loader2,
  X,
  Download,
  Trash2,
  Lock,
  Database,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

type TabType = 'personal' | 'security' | 'privacy';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
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
  const inputStyle = "w-full h-12 px-4 rounded-xl border border-border dark:border-sidebar-hover bg-white dark:bg-bg-page focus:border-plano-500 dark:focus:bg-white/10 focus:outline-none transition-all text-sm font-semibold text-text-primary shadow-sm";

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <form onSubmit={handleUpdateProfile} className="bg-bg-surface p-8 rounded-card border border-border shadow-sm flex flex-col gap-8">
              <div className="flex items-center gap-3 pb-5 border-b border-border dark:border-sidebar-hover">
                 <div className="w-10 h-10 rounded-xl bg-plano-50 dark:bg-white/10 text-plano-600 dark:text-plano-400 flex items-center justify-center border border-plano-100 dark:border-sidebar-hover shadow-sm">
                   <User size={20} />
                 </div>
                 <h2 className="text-2xl font-serif font-bold text-text-primary">Personal Information</h2>
              </div>

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
                 <label className={labelStyle}>Primary Contact Email</label>
                 <div className="relative">
                   <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      disabled
                      suppressHydrationWarning
                      type="email" 
                      value={form.email}
                      className={cn(inputStyle, "pl-11 dark:bg-white/5 cursor-not-allowed opacity-70")}
                    />
                 </div>
                 <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 ml-1">
                   <Shield size={10} className="text-success-500" /> This account is linked to your enterprise directory.
                 </p>
              </div>
   
              <div className="pt-4 border-t border-border dark:border-sidebar-hover flex items-center gap-4">
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
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-border dark:border-sidebar-hover flex items-center justify-between group hover:border-plano-200 transition-all">
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
        );

      case 'security':
        return (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-bg-surface p-8 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-8">
              <div className="flex items-center gap-3 pb-5 border-b border-border dark:border-sidebar-hover">
                 <div className="w-10 h-10 rounded-xl bg-plano-50 dark:bg-white/10 text-plano-600 dark:text-plano-400 flex items-center justify-center border border-plano-100 dark:border-sidebar-hover shadow-sm">
                   <Key size={20} />
                 </div>
                 <h2 className="text-2xl font-serif font-bold text-text-primary">Security Settings</h2>
              </div>

              <div className="flex flex-col gap-6">
                 <div className="p-6 rounded-2xl border border-border dark:border-sidebar-hover bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                       <span className="text-sm font-bold text-text-primary">Two-Factor Authentication (2FA)</span>
                       <p className="text-xs text-gray-500">Secure your account with an extra layer of protection.</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-plano-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-plano-700 transition-all shadow-sm">
                       Enable 2FA
                    </button>
                 </div>

                 <div className="p-6 rounded-2xl border border-border dark:border-sidebar-hover bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                       <span className="text-sm font-bold text-text-primary">Change Password</span>
                       <p className="text-xs text-gray-500">Last changed 4 months ago.</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg border-2 border-plano-200 dark:border-sidebar-hover text-plano-600 dark:text-plano-400 text-[10px] font-bold uppercase tracking-widest hover:bg-plano-50 dark:hover:bg-white/10 transition-all">
                       Update Password
                    </button>
                 </div>

                 <div className="p-6 rounded-2xl border border-border dark:border-sidebar-hover bg-gray-50/50 dark:bg-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-border dark:border-sidebar-hover pb-4">
                       <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-text-primary">Active Sessions</span>
                          <p className="text-xs text-gray-500">Devices currently logged into your account.</p>
                       </div>
                       <button className="text-[10px] font-bold text-danger-600 uppercase tracking-widest hover:underline">
                          Log out from all
                       </button>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-bg-surface dark:bg-white/10 border border-border dark:border-sidebar-hover flex items-center justify-center shadow-sm">
                             <img src="https://flagcdn.com/in.svg" className="w-4 h-auto opacity-70" alt="India" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-text-primary">Chrome on Windows</span>
                             <span className="text-[10px] text-gray-400">103.114.120.245 • Current Session</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-bg-surface p-8 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-8">
              <div className="flex items-center justify-between pb-5 border-b border-border dark:border-sidebar-hover">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-plano-600 text-white flex items-center justify-center border border-plano-600 shadow-sm">
                       <Shield size={20} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-serif font-bold text-text-primary leading-none">Data Privacy</h2>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Your data, your control</p>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-8">
                 {/* Export Section */}
                 <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                       <Database size={14} className="text-plano-500" /> Export Personal Data
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                       Download a comprehensive archive of your profile, settings, and subscription history in standard JSON format.
                    </p>
                    <button className="h-12 rounded-xl border-2 border-plano-200 dark:border-sidebar-hover bg-plano-50 dark:bg-white/5 text-plano-700 dark:text-plano-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-plano-600 hover:text-white hover:border-plano-600 transition-all group">
                       <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                       Request Data Export
                    </button>
                 </div>

                 {/* Integrations */}
                 <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                       <Lock size={14} className="text-success-500" /> Authorized Systems
                    </h4>
                    <div className="rounded-2xl border border-border dark:border-sidebar-hover p-4 bg-gray-50/30 dark:bg-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-bg-surface dark:bg-white/10 border border-border dark:border-sidebar-hover flex items-center justify-center shadow-sm text-xs font-bold font-serif text-text-primary">P</div>
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-text-primary">Plano Core Directory</span>
                             <span className="text-[10px] text-gray-400 font-medium tracking-tight">Access Level: Administrative</span>
                          </div>
                       </div>
                       <span className="px-2 py-0.5 rounded-full bg-success-50 dark:bg-success-900/20 text-[10px] font-bold text-success-700 dark:text-success-400">ACTIVE</span>
                    </div>
                 </div>


              </div>

              <div className="bg-gray-100/30 dark:bg-white/5 p-6 rounded-2xl flex items-center justify-between border border-border dark:border-sidebar-hover">
                 <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                    <Shield size={12} className="text-plano-400" />
                    Last reviewed on Feb 12, 2026
                 </div>
                 <Link 
                   href="/privacy-policy" 
                   className="text-[11px] font-bold text-plano-600 hover:text-plano-400 flex items-center gap-1 uppercase tracking-wider"
                 >
                    Full Policy <ExternalLink size={10} />
                 </Link>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-4xl mx-auto">
      {/* Header with Background Accent */}
      <div className="relative h-48 w-full rounded-[2rem] bg-plano-900 overflow-hidden shadow-2xl flex items-end p-8 border border-white/5 group">
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-plano-600/20 to-transparent pointer-events-none"></div>
         <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-plano-500 rounded-full blur-[100px] opacity-20"></div>
         
         <div className="flex items-center gap-6 z-10">
            <div className="relative group">
              <div 
                className="w-24 h-24 rounded-full bg-white text-plano-900 border-[6px] border-plano-800 shadow-xl flex items-center justify-center text-3xl font-serif font-bold uppercase overflow-hidden cursor-pointer"
                onClick={() => setActiveTab('personal')}
              >
                {user?.name?.charAt(0) || 'U'}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
           <section className="bg-bg-surface p-6 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-6">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                 <button 
                   onClick={() => setActiveTab('personal')}
                   className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all group text-xs font-bold uppercase tracking-widest",
                    activeTab === 'personal' ? "bg-plano-600 dark:bg-plano-500 text-white" : "bg-bg-page dark:bg-white/5 text-gray-500 hover:bg-sidebar-hover dark:hover:bg-white/10"
                   )}
                 >
                    <div className="flex items-center gap-3">
                      <User size={16} /> Personal Info
                    </div>
                    {activeTab === 'personal' && <ChevronRight size={14} className="text-white" />}
                 </button>

                 <button 
                   onClick={() => setActiveTab('security')}
                   className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all group text-xs font-bold uppercase tracking-widest",
                    activeTab === 'security' ? "bg-plano-600 dark:bg-plano-500 text-white" : "bg-bg-page dark:bg-white/5 text-gray-500 hover:bg-sidebar-hover dark:hover:bg-white/10"
                   )}
                 >
                    <div className="flex items-center gap-3">
                      <Key size={16} /> Security Settings
                    </div>
                    {activeTab === 'security' && <ChevronRight size={14} className="text-white" />}
                 </button>

                 <button 
                   onClick={() => setActiveTab('privacy')}
                   className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all group text-xs font-bold uppercase tracking-widest",
                    activeTab === 'privacy' ? "bg-plano-600 dark:bg-plano-500 text-white" : "bg-bg-page dark:bg-white/5 text-gray-500 hover:bg-sidebar-hover dark:hover:bg-white/10"
                   )}
                 >
                    <div className="flex items-center gap-3">
                      <Shield size={16} /> Data Privacy
                    </div>
                    {activeTab === 'privacy' && <ChevronRight size={14} className="text-white" />}
                 </button>
                 
                 <div className="h-px bg-border dark:bg-sidebar-hover my-2"></div>

                 <button 
                   onClick={logout}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger-50 dark:bg-danger-900/10 text-danger-600 dark:text-danger-400 text-xs font-bold uppercase tracking-widest hover:bg-danger-100 dark:hover:bg-danger-900/20 transition-all font-mono"
                 >
                    <LogOut size={16} /> Sign out session
                 </button>
              </div>
           </section>

           <div className="bg-info-50/30 dark:bg-white/5 p-6 rounded-card border border-info-100 dark:border-sidebar-hover flex items-start gap-4 shadow-sm">
              <Clock size={20} className="text-info-500 shrink-0 mt-1" />
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-bold text-info-700 dark:text-plano-400 uppercase tracking-widest">System Status</span>
                 <p className="text-[10px] text-info-600 dark:text-text-secondary font-medium leading-relaxed">
                   Account integrity active. Last ID synchronization at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                 </p>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
           {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
