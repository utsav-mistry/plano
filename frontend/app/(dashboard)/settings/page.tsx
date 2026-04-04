'use client';

import React, { useState } from 'react';
import { 
  Settings, 
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
    { id: 'regional', label: 'Regional', icon: <Globe size={18} /> },
  ];

  const sectionHeader = (title: string, subtitle: string) => (
    <div className="mb-8 pb-4 border-b border-gray-100">
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
           <nav className="bg-white p-3 rounded-card border border-border shadow-sm flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all group border-0 text-left outline-none",
                    activeSection === item.id 
                      ? "bg-plano-900 text-white shadow-lg shadow-plano-900/20" 
                      : "text-text-secondary hover:bg-gray-50 bg-transparent"
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
           
           <div className="mt-6 bg-plano-50/50 p-6 rounded-card border border-plano-100 flex flex-col gap-3">
              <Zap size={20} className="text-plano-600" />
              <p className="text-[10px] text-plano-700 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Supercharge your workflow with Plano Enterprise.
              </p>
              <button className="text-[10px] font-bold text-plano-600 bg-white border border-plano-200 px-4 py-2 rounded-lg hover:bg-plano-50 transition-all uppercase tracking-widest inline-block border-0 outline-none">
                 Upgrade Plan
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
           <div className="bg-bg-surface p-8 rounded-card border border-border shadow-sm min-h-[500px]">
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
                                  "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group border-0 outline-none",
                                  t.active ? "border-plano-600 bg-plano-50/30" : "border-gray-100 hover:border-gray-200 bg-gray-25"
                                )}
                              >
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                  t.active ? "bg-plano-600 text-white shadow-lg" : "bg-white text-gray-400 group-hover:text-plano-600 shadow-sm"
                                )}>
                                  {t.icon}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-info-50 text-info-600 flex items-center justify-center"><Monitor size={20} /></div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold uppercase tracking-wider">Smooth Animations</span>
                                 <span className="text-[10px] text-gray-400 font-medium">Reduce motion for performance.</span>
                              </div>
                           </div>
                           <Toggle className="text-plano-600" />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center"><Smartphone size={20} /></div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold uppercase tracking-wider">Compact View</span>
                                 <span className="text-[10px] text-gray-400 font-medium">Show more record in tables.</span>
                              </div>
                           </div>
                           <Toggle className="text-gray-200" />
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
                        <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-gray-25 border border-gray-100 hover:border-plano-200 transition-all cursor-pointer">
                           <div className="flex items-center gap-4">
                             <div className={cn("p-3 rounded-xl", n.active ? "bg-plano-100 text-plano-600" : "bg-gray-100 text-gray-400")}>
                               {n.icon}
                             </div>
                             <div className="flex flex-col">
                               <span className="text-sm font-bold uppercase tracking-widest">{n.title}</span>
                               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">{n.subtitle}</span>
                             </div>
                           </div>
                           <div className={cn(
                             "w-12 h-6 rounded-full relative transition-all duration-300",
                             n.active ? "bg-success-500" : "bg-gray-300"
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
           </div>
        </div>
      </div>
    </div>
  );
}
