'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Mail, 
  Key, 
  ShieldAlert, 
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const mockInternalUsers = [
  { id: '1', name: 'Ravi Mistry', email: 'ravi@plano.com', role: 'ADMIN', created: 'Jan 15, 2025', lastLogin: '2 mins ago', isActive: true },
  { id: '2', name: 'Alok Singh', email: 'alok@plano.com', role: 'INTERNAL_USER', created: 'Feb 10, 2025', lastLogin: '1 hour ago', isActive: true },
  { id: '3', name: 'Mehak Rao', email: 'mehak@plano.com', role: 'INTERNAL_USER', created: 'Feb 20, 2025', lastLogin: '1 day ago', isActive: true },
];

const mockCustomers = [
  { id: 'C1', name: 'Acme Corp', email: 'billing@acme.com', subsCount: 2, totalBilled: 154000, outstanding: 12450, joined: 'Jan 01, 2025' },
  { id: 'C2', name: 'TechSolve Ltd', email: 'finance@techsolve.in', subsCount: 1, totalBilled: 25000, outstanding: 0, joined: 'Feb 12, 2025' },
  { id: 'C3', name: 'StartupX', email: 'hello@startupx.com', subsCount: 3, totalBilled: 45000, outstanding: 9999, joined: 'Mar 05, 2025' },
  { id: 'C4', name: 'Global Labs', email: 'admin@globallabs.com', subsCount: 1, totalBilled: 12450, outstanding: 0, joined: 'Mar 15, 2025' },
  { id: 'C5', name: 'Infinity Soft', email: 'billing@infinity.com', subsCount: 1, totalBilled: 4500, outstanding: 0, joined: 'Mar 20, 2025' },
];

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState<'INTERNAL' | 'CUSTOMER'>('INTERNAL');

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary uppercase tracking-tight">Directory</h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
             Manage team members and customer portal access.
          </p>
        </div>
        <button 
          className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
        >
          <UserPlus size={18} />
          Invite User
        </button>
      </div>

      {/* Tabs / Multi-Filter Bar */}
      <div className="bg-bg-surface p-4 rounded-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center p-1 bg-gray-100 rounded-input border border-border w-full md:w-auto">
            <button 
               onClick={() => setActiveTab('INTERNAL')}
               className={cn(
                  "flex-1 md:flex-none px-6 py-2 rounded-btn text-xs font-bold uppercase tracking-widest transition-all",
                  activeTab === 'INTERNAL' ? "bg-white text-plano-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
            >
               Team Members ({mockInternalUsers.length})
            </button>
            <button 
               onClick={() => setActiveTab('CUSTOMER')}
               className={cn(
                  "flex-1 md:flex-none px-6 py-2 rounded-btn text-xs font-bold uppercase tracking-widest transition-all",
                  activeTab === 'CUSTOMER' ? "bg-white text-plano-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
            >
               Customers ({mockCustomers.length})
            </button>
         </div>

         <div className="flex items-center gap-3 flex-1 md:max-w-sm">
            <div className="relative flex-1">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder={activeTab === 'INTERNAL' ? "Search team..." : "Search customers..."}
                 className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans"
               />
            </div>
            <button className="p-2.5 border border-border bg-white rounded-input text-gray-400 hover:text-text-primary transition-colors">
               <Filter size={18} />
            </button>
         </div>
      </div>

      {/* Content Table */}
      <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm">
         {activeTab === 'INTERNAL' ? (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-border bg-gray-50/50">
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">User Profile</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Role</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Created On</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center">Status</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {mockInternalUsers.map((user) => (
                        <tr key={user.id} className="group hover:bg-gray-25 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-plano-50 border border-plano-100 flex items-center justify-center text-plano-700 font-bold text-xs">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-primary">{user.name}</span>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest group-hover:text-plano-600 transition-colors">{user.email}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              <span className={cn(
                                 "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                                 user.role === 'ADMIN' ? "bg-plano-900 border-plano-900 text-white" : "bg-gray-100 border-gray-200 text-text-secondary"
                              )}>
                                 {user.role}
                              </span>
                           </td>
                           <td className="py-4 px-6">
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-xs font-bold text-text-primary">{user.created}</span>
                                 <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Login: {user.lastLogin}</span>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-center">
                              <button className="w-10 h-5 bg-success-500 rounded-full relative transition-all shadow-sm">
                                 <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm" />
                              </button>
                           </td>
                           <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button className="p-2 rounded-btn text-gray-400 hover:text-plano-600 hover:bg-plano-50 transition-all group-hover:scale-105">
                                    <Edit2 size={16} />
                                 </button>
                                 <button className="p-2 rounded-btn text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-all opacity-0 group-hover:opacity-100">
                                    <ShieldAlert size={16} />
                                 </button>
                                 <button className="p-2 rounded-btn text-gray-400 hover:text-text-primary transition-all">
                                    <MoreVertical size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="overflow-x-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-border bg-gray-50/50">
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Customer Profile</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Active Subs</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Total Billed</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Outstanding</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right whitespace-nowrap">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {mockCustomers.map((cust) => (
                        <tr key={cust.id} className="group hover:bg-gray-25 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-warning-50 border border-warning-100 flex items-center justify-center text-warning-700 font-bold text-xs">
                                    {cust.name.split(' ').map(n => n[0]).join('')}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-primary">{cust.name}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">Joined {cust.joined}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                               <span className="px-2.5 py-1 rounded-full bg-plano-50 text-plano-700 text-[10px] font-bold uppercase tracking-widest border border-plano-100">
                                  {cust.subsCount} Sub{cust.subsCount > 1 ? 's' : ''}
                               </span>
                           </td>
                           <td className="py-4 px-6 font-mono text-xs font-bold text-text-primary">
                              {formatCurrency(cust.totalBilled, 'INR')}
                           </td>
                           <td className="py-4 px-6">
                              <span className={cn(
                                 "font-mono text-xs font-bold",
                                 cust.outstanding > 0 ? "text-danger-600 bg-danger-50 px-2 py-0.5 rounded" : "text-success-600"
                              )}>
                                 {formatCurrency(cust.outstanding, 'INR')}
                              </span>
                           </td>
                           <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-border text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-plano-600 hover:border-plano-400 transition-all">
                                    <Mail size={12} />
                                    Email
                                 </button>
                                 <button className="p-2 rounded-btn text-gray-400 hover:text-plano-600 hover:bg-plano-50 transition-all">
                                    <ArrowUpRight size={18} />
                                 </button>
                                 <button className="p-2 rounded-btn text-gray-400 hover:text-text-primary transition-all">
                                    <MoreVertical size={18} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
}
