'use client';

import React, { useState } from 'react';
import { 
  Palette, 
  Bell, 
  Lock, 
  Globe, 
  CreditCard, 
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Zap,
  ToggleLeft as Toggle,
  Mail,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('appearance');
  const [theme, setTheme] = useState('system');

  const navItems = [
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    { id: 'billing', label: 'Billing & Plans', icon: <CreditCard size={18} /> },
  ];

  const sectionHeader = (title: string, subtitle: string) => (
    <div className="mb-8 pb-4 border-b border-border dark:border-sidebar-hover">
       <h2 className="text-2xl font-serif font-bold text-text-primary">{title}</h2>
       <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-serif">Settings</h1>
        <p className="text-sm text-text-secondary font-medium uppercase tracking-widest">Global configurations for your account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
           <nav className="bg-bg-surface p-3 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all group border-0 text-left outline-none",
                    activeSection === item.id 
                      ? "bg-plano-600 dark:bg-plano-500 text-white shadow-lg" 
                      : "text-text-secondary hover:bg-bg-page dark:hover:bg-white/10 bg-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(activeSection === item.id ? "text-white" : "text-plano-400")}>
                      {item.icon}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={cn(activeSection === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                </button>
              ))}
           </nav>
           
           <div className="mt-6 bg-plano-50 dark:bg-plano-900/20 p-6 rounded-card border border-plano-100 dark:border-plano-900/30 flex flex-col gap-3">
              <Zap size={20} className="text-plano-600 dark:text-plano-400" />
              <p className="text-[10px] text-plano-700 dark:text-plano-300 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Supercharge your workflow with Plano Enterprise.
              </p>
              <button className="text-[10px] font-bold text-plano-600 dark:text-plano-400 bg-white dark:bg-white/10 border border-plano-200 dark:border-white/10 px-4 py-2 rounded-lg hover:bg-plano-50 dark:hover:bg-white/20 transition-all uppercase tracking-widest inline-block outline-none">
                 Upgrade Plan
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
           <div className="bg-bg-surface p-8 rounded-card border border-border dark:border-sidebar-hover shadow-sm min-h-[500px]">
              {activeSection === 'appearance' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                   {sectionHeader('Appearance', 'Customize your dashboard interface and theme.')}
                   
                    <div className="flex flex-col gap-10">
                       <div>
                          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-4">Theme Preference</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             {[
                               { id: 'light', label: 'Light Mode', icon: <Sun size={20} />, active: theme === 'light' },
                               { id: 'dark', label: 'Dark Mode', icon: <Moon size={18} />, active: theme === 'dark' },
                               { id: 'system', label: 'System', icon: <Monitor size={18} />, active: theme === 'system' },
                             ].map((t) => (
                               <button
                                 key={t.id}
                                 onClick={() => {
                                   setTheme(t.id);
                                   if (t.id === 'dark') document.documentElement.classList.add('dark');
                                   else if (t.id === 'light') document.documentElement.classList.remove('dark');
                                 }}
                                 className={cn(
                                   "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group outline-none",
                                   t.active 
                                     ? "border-plano-600 dark:border-plano-400 bg-plano-50/30 dark:bg-plano-400/10" 
                                     : "border-border dark:border-sidebar-hover hover:border-plano-200 dark:hover:border-plano-700 bg-bg-page dark:bg-white/5"
                                 )}
                               >
                                 <div className={cn(
                                   "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                   t.active 
                                     ? "bg-plano-600 dark:bg-plano-500 text-white shadow-lg" 
                                     : "bg-white dark:bg-white/10 text-gray-400 group-hover:text-plano-600 dark:group-hover:text-white shadow-sm"
                                 )}>
                                   {t.icon}
                                 </div>
                                 <span className={cn(
                                   "text-[10px] font-bold uppercase tracking-widest",
                                   t.active ? "text-text-primary" : "text-text-secondary"
                                 )}>{t.label}</span>
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="flex flex-col gap-6">
                         <div className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-sidebar-hover hover:bg-bg-page dark:hover:bg-white/5 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-lg bg-info-50 dark:bg-info-900/20 text-info-600 dark:text-info-400 flex items-center justify-center"><Monitor size={20} /></div>
                               <div className="flex flex-col">
                                  <span className="text-sm font-bold uppercase tracking-wider text-text-primary">Smooth Animations</span>
                                  <span className="text-[10px] text-text-secondary font-medium uppercase tracking-tight">Reduce motion for performance.</span>
                               </div>
                            </div>
                            <Toggle className="text-plano-600 dark:text-plano-400" />
                         </div>


                       </div>
                    </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                   {sectionHeader('Notifications', 'Determine how and when you want to be alerted.')}
                   
                   <div className="flex flex-col gap-6">
                      {[
                        { title: 'Email Alerts', subtitle: 'Receive invoice and payment updates via email.', icon: <Mail size={18} />, active: true },
                        { title: 'Browser Push', subtitle: 'Real-time alerts when you are using the app.', icon: <Bell size={18} />, active: false },
                        { title: 'System Security', subtitle: 'Alerts for logins from new devices/IPs.', icon: <ShieldCheck size={18} />, active: true },
                      ].map((n, i) => (
                        <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-bg-page dark:bg-white/5 border border-border dark:border-sidebar-hover hover:border-plano-400 transition-all cursor-pointer">
                           <div className="flex items-center gap-4">
                             <div className={cn("p-3 rounded-xl", n.active ? "bg-plano-100 dark:bg-plano-900/40 text-plano-600 dark:text-plano-400" : "bg-gray-100 dark:bg-white/10 text-gray-400")}>
                               {n.icon}
                             </div>
                             <div className="flex flex-col">
                               <span className={cn("text-sm font-bold uppercase tracking-widest", n.active ? "text-text-primary" : "text-text-secondary")}>{n.title}</span>
                               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">{n.subtitle}</span>
                             </div>
                           </div>
                           <div className={cn(
                             "w-12 h-6 rounded-full relative transition-all duration-300",
                             n.active ? "bg-success-500" : "bg-gray-300 dark:bg-white/10"
                           )}>
                              <div className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                                n.active ? "left-7" : "left-1"
                              )}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                   {sectionHeader('Security', 'Manage your account safety and access protocols.')}
                   
                   <div className="flex flex-col gap-6">
                      <div className="p-6 rounded-2xl bg-bg-page dark:bg-white/5 border border-border dark:border-sidebar-hover flex items-center justify-between">
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-text-primary uppercase tracking-widest">Two-Factor Authentication</span>
                            <p className="text-[10px] text-text-secondary uppercase tracking-tight font-bold">Recommended for high-security accounts.</p>
                         </div>
                         <button className="px-4 py-2 rounded-lg bg-plano-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-plano-700 transition-all shadow-sm">
                            Enable 2FA
                         </button>
                      </div>

                      <div className="p-6 rounded-2xl bg-bg-page dark:bg-white/5 border border-border dark:border-sidebar-hover flex items-center justify-between">
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-text-primary uppercase tracking-widest">Password Protocol</span>
                            <p className="text-[10px] text-text-secondary uppercase tracking-tight font-bold">Last modified approx. 124 days ago.</p>
                         </div>
                         <button className="px-4 py-2 rounded-lg border border-border dark:border-sidebar-hover text-text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-bg-page dark:hover:bg-white/10 transition-all font-mono">
                            Update Keys
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {activeSection === 'billing' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                   {sectionHeader('Billing & Plans', 'Review your current subscription and usage metrics.')}
                   
                   <div className="flex flex-col gap-8">
                      <div className="p-8 rounded-3xl bg-plano-900 text-white flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Zap size={120} />
                         </div>
                         <div className="flex items-center justify-between relative z-10">
                            <div className="flex flex-col gap-1">
                               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Current Tier</span>
                               <h3 className="text-3xl font-serif">Plano Enterprise</h3>
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">ACTIVE</span>
                         </div>
                         <div className="flex items-end justify-between relative z-10 pt-4">
                            <div className="flex flex-col gap-1">
                               <span className="text-3xl font-bold font-serif">$249.00<span className="text-sm font-sans font-normal text-white/50">/mo</span></span>
                               <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Next cycle: May 12, 2026</span>
                            </div>
                            <button className="px-6 py-3 rounded-xl bg-white text-plano-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all shadow-xl">
                               Manage Billing
                            </button>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {[
                           { label: 'API Requests', value: '45,200', limit: '100k', unit: 'reqs' },
                           { label: 'Total Invoices', value: '1,240', limit: 'Unlimited', unit: 'count' },
                         ].map((stat, i) => (
                           <div key={i} className="p-6 rounded-2xl border border-border dark:border-sidebar-hover bg-bg-page dark:bg-white/5 flex flex-col gap-4">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">{stat.label}</span>
                                <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">{stat.value} / {stat.limit}</span>
                             </div>
                             <div className="h-1.5 w-full bg-border dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-plano-600 dark:bg-plano-400 w-2/5 rounded-full shadow-[0_0_10px_rgba(var(--color-plano-600),0.3)]"></div>
                             </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}



           </div>
        </div>
      </div>
    </div>
  );
}
