'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Mail, 
  ShieldAlert, 
  ArrowUpRight,
  UserPlus,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserCircle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState<'INTERNAL' | 'CUSTOMER'>('INTERNAL');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { success, error: toastError } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.users.getAll();
      if (response.success) {
        const data = response.data as any;
        setUsers(data.users ?? data ?? []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleUserStatus(id: string) {
    try {
      await api.users.toggleStatus(id);
      success('User updated', 'Status toggled successfully');
      fetchUsers();
    } catch (err: any) {
      toastError('Update failed', err.message);
    }
  }

  // Define customers as 'portal_user' and internal as anything else (admin, internal_user)
  const internalUsers = users.filter(u => u.role !== 'portal_user');
  const customers = users.filter(u => u.role === 'portal_user');

  const displayUsers = activeTab === 'INTERNAL' ? internalUsers : customers;
  
  const filteredUsers = displayUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-text-primary">Directory</h1>
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
               Team Members ({internalUsers.length})
            </button>
            <button 
               onClick={() => setActiveTab('CUSTOMER')}
               className={cn(
                  "flex-1 md:flex-none px-6 py-2 rounded-btn text-xs font-bold uppercase tracking-widest transition-all",
                  activeTab === 'CUSTOMER' ? "bg-white text-plano-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
            >
               Customers ({customers.length})
            </button>
         </div>

         <div className="flex items-center gap-3 flex-1 md:max-w-sm">
            <div className="relative flex-1">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder={activeTab === 'INTERNAL' ? "Search team..." : "Search customers..."}
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-gray-25 focus:border-plano-500 focus:bg-white focus:outline-none transition-all text-sm font-sans"
               />
            </div>
            <button className="p-2.5 border border-border bg-white rounded-input text-gray-400 hover:text-text-primary transition-colors">
               <Filter size={18} />
            </button>
         </div>
      </div>

      {/* Content Table */}
      <div className="bg-bg-surface rounded-card border border-border overflow-hidden shadow-sm min-h-[400px] flex flex-col">
         {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
               <Loader2 className="w-8 h-8 text-plano-600 animate-spin" />
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accessing Directory...</p>
            </div>
         ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
               <AlertCircle size={32} className="text-danger-500" />
               <p className="text-sm font-bold text-text-primary uppercase">{error}</p>
               <button onClick={fetchUsers} className="text-xs font-bold text-plano-600 underline">Reload directory</button>
            </div>
         ) : filteredUsers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
              <UserCircle size={48} className="text-gray-200" />
              <p className="text-lg font-serif font-bold text-text-primary">No users found</p>
              <p className="text-xs text-text-secondary font-medium max-w-[200px]">We couldn't find any {activeTab.toLowerCase()} matching your search.</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-border bg-gray-50/50">
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                          {activeTab === 'INTERNAL' ? 'User Profile' : 'Customer Profile'}
                        </th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Role / Type</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Joined On</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center">Status</th>
                        <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {filteredUsers.map((user) => (
                        <tr key={user._id} className="group hover:bg-gray-25 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-plano-50 border border-plano-100 flex items-center justify-center text-plano-700 font-bold text-xs">
                                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-primary">{user.name}</span>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest group-hover:text-plano-600 transition-colors">
                                      {user.email}
                                    </span>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-1.5">
                                 {user.role === 'admin' ? <ShieldCheck size={12} className="text-plano-600" /> : null}
                                 <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                                    user.role === 'admin' ? "bg-plano-900 border-plano-900 text-white" : 
                                    user.role === 'portal_user' ? "bg-warning-50 border-warning-100 text-warning-700" :
                                    "bg-gray-100 border-gray-200 text-text-secondary"
                                 )}>
                                    {user.role.replace('_', ' ')}
                                 </span>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-xs font-bold text-text-primary">
                                   {new Date(user.createdAt).toLocaleDateString()}
                                 </span>
                                 <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">
                                   Last Active: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                                 </span>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-center">
                              <button 
                                onClick={() => toggleUserStatus(user._id)}
                                className={cn(
                                  "w-10 h-5 rounded-full relative transition-all shadow-sm",
                                  user.isActive ? "bg-success-500" : "bg-gray-300"
                                )}
                              >
                                 <div className={cn(
                                   "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                   user.isActive ? "right-0.5" : "left-0.5"
                                 )} />
                              </button>
                           </td>
                           <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button className="p-2 rounded-btn text-gray-400 hover:text-plano-600 hover:bg-plano-50 transition-all">
                                    <Mail size={16} />
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
         )}
      </div>
    </div>
  );
}
