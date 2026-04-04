'use client';

import React, { useState, useEffect } from 'react';
import {
   Search,
   Filter,
   Mail,
   Trash2,
   UserPlus,
   Loader2,
   AlertCircle,
   ShieldCheck,
   UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

type DirectoryUser = {
   _id: string;
   name: string;
   email: string;
   role: string;
   isActive: boolean;
   createdAt: string;
   updatedAt?: string;
};

type UsersResponseData = {
   users?: DirectoryUser[];
} | DirectoryUser[] | null;

const getErrorMessage = (error: unknown, fallback: string) =>
   error instanceof Error ? error.message : fallback;

export default function UsersManagementPage() {
   const [activeTab, setActiveTab] = useState<'INTERNAL' | 'CUSTOMER'>('INTERNAL');
   const [users, setUsers] = useState<DirectoryUser[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [search, setSearch] = useState('');
   const [showInviteModal, setShowInviteModal] = useState(false);
   const [userPendingDelete, setUserPendingDelete] = useState<DirectoryUser | null>(null);
   const [isInviting, setIsInviting] = useState(false);
   const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
   const [inviteForm, setInviteForm] = useState({ name: '', email: '' });
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
            const data = response.data as UsersResponseData;
            setUsers(Array.isArray(data) ? data : (data?.users ?? []));
         }
      } catch (error: unknown) {
         setError(getErrorMessage(error, 'Failed to load users'));
      } finally {
         setIsLoading(false);
      }
   }

   async function toggleUserStatus(id: string) {
      try {
         await api.users.toggleStatus(id);
         success('User updated', 'Status toggled successfully');
         fetchUsers();
      } catch (error: unknown) {
         toastError('Update failed', getErrorMessage(error, 'Unable to update user status'));
      }
   }

   async function inviteCustomer() {
      if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
         toastError('Missing details', 'Customer name and email are required.');
         return;
      }

      setIsInviting(true);
      try {
         await api.auth.inviteCustomer({
            name: inviteForm.name.trim(),
            email: inviteForm.email.trim(),
         });
         success('Invitation sent', 'Customer invitation email with accept button was sent from support.');
         setShowInviteModal(false);
         setInviteForm({ name: '', email: '' });
         await fetchUsers();
      } catch (error: unknown) {
         toastError('Invitation failed', getErrorMessage(error, 'Unable to send invitation'));
      } finally {
         setIsInviting(false);
      }
   }

   async function deleteUser(user: DirectoryUser) {
      setDeletingUserId(user._id);
      try {
         await api.users.delete(user._id);
         setUsers((current) => current.filter((entry) => entry._id !== user._id));
         success('User deleted', `${user.name} was removed successfully.`);
         setUserPendingDelete(null);
      } catch (error: unknown) {
         toastError('Delete failed', getErrorMessage(error, 'Unable to delete user'));
      } finally {
         setDeletingUserId(null);
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
               onClick={() => setShowInviteModal(true)}
               className="flex items-center gap-2 px-5 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm"
            >
               <UserPlus size={18} />
               Invite User
            </button>
         </div>

         {/* Tabs / Multi-Filter Bar */}
         <div className="bg-bg-surface p-4 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center p-1 bg-gray-100 dark:bg-white/5 rounded-input border border-border dark:border-sidebar-hover w-full md:w-auto">
               <button
                  onClick={() => setActiveTab('INTERNAL')}
                  className={cn(
                     "flex-1 md:flex-none px-6 py-2 rounded-btn text-xs font-bold uppercase tracking-widest transition-all",
                     activeTab === 'INTERNAL' ? "bg-white dark:bg-plano-600 text-plano-600 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  )}
               >
                  Team Members ({internalUsers.length})
               </button>
               <button
                  onClick={() => setActiveTab('CUSTOMER')}
                  className={cn(
                     "flex-1 md:flex-none px-6 py-2 rounded-btn text-xs font-bold uppercase tracking-widest transition-all",
                     activeTab === 'CUSTOMER' ? "bg-white dark:bg-plano-600 text-plano-600 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
                     className="w-full h-10 pl-10 pr-4 rounded-input border border-border dark:border-sidebar-hover bg-gray-25 dark:bg-bg-page focus:border-plano-500 dark:focus:bg-white/10 focus:outline-none transition-all text-sm font-sans text-text-primary"
                  />
               </div>
               <button className="p-2.5 border border-border dark:border-sidebar-hover bg-bg-surface rounded-input text-gray-400 hover:text-text-primary transition-colors">
                  <Filter size={18} />
               </button>
            </div>
         </div>

         {/* Content Table */}
         <div className="bg-bg-surface rounded-card border border-border dark:border-sidebar-hover overflow-hidden shadow-sm min-h-[400px] flex flex-col">
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
                  <UserCircle size={48} className="text-gray-200 dark:text-white/10" />
                  <p className="text-lg font-serif font-bold text-text-primary">No users found</p>
                  <p className="text-xs text-text-secondary font-medium max-w-[200px]">We could not find any {activeTab.toLowerCase()} matching your search.</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-border dark:border-sidebar-hover bg-gray-50/50 dark:bg-white/10">
                           <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                              {activeTab === 'INTERNAL' ? 'User Profile' : 'Customer Profile'}
                           </th>
                           <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Role / Type</th>
                           <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Joined On</th>
                           <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-center">Status</th>
                           <th className="py-4 px-6 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border dark:divide-sidebar-hover">
                        {filteredUsers.map((user) => (
                           <tr key={user._id} className="group hover:bg-gray-25 dark:hover:bg-white/10 transition-colors">
                              <td className="py-4 px-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-plano-50 dark:bg-white/10 border border-plano-100 dark:border-white/5 flex items-center justify-center text-plano-700 dark:text-plano-300 font-bold text-xs">
                                       {user.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-sm font-bold text-text-primary">{user.name}</span>
                                       <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest group-hover:text-plano-600 dark:group-hover:text-plano-400 transition-colors">
                                          {user.email}
                                       </span>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-4 px-6">
                                 <div className="flex items-center gap-1.5">
                                    {user.role === 'admin' ? <ShieldCheck size={12} className="text-plano-600 dark:text-plano-400" /> : null}
                                    <span className={cn(
                                       "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                                       user.role === 'admin' ? "bg-plano-600 dark:bg-plano-500 border-plano-600 dark:border-plano-400 text-white" :
                                          user.role === 'portal_user' ? "bg-warning-50 dark:bg-warning-900/20 border-warning-100 dark:border-warning-800 text-warning-700 dark:text-warning-400" :
                                             "bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/10 text-text-secondary"
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
                                       user.isActive ? "bg-success-500" : "bg-gray-300 dark:bg-white/20"
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
                                    <button className="p-2 rounded-btn text-gray-400 hover:text-plano-600 hover:bg-plano-50 dark:hover:bg-white/10 transition-all">
                                       <Mail size={16} />
                                    </button>
                                    {user.role === 'portal_user' ? (
                                       <button
                                          type="button"
                                          onClick={() => setUserPendingDelete(user)}
                                          disabled={deletingUserId === user._id}
                                          className="p-2 rounded-btn text-gray-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all disabled:opacity-50"
                                          title="Delete invited/customer user"
                                       >
                                          {deletingUserId === user._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                       </button>
                                    ) : null}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         {showInviteModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="w-full max-w-md rounded-2xl border border-border dark:border-sidebar-hover bg-bg-surface shadow-2xl p-6">
                  <h2 className="text-xl font-bold text-text-primary">Invite Customer</h2>
                  <p className="mt-1 text-sm text-text-secondary">An invitation email with an Accept Invitation button will be sent automatically.</p>

                  <div className="mt-5 flex flex-col gap-3">
                     <input
                        type="text"
                        value={inviteForm.name}
                        onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Customer name"
                        className="h-11 rounded-lg border border-border dark:border-sidebar-hover bg-white dark:bg-bg-page text-text-primary px-3 text-sm outline-none focus:border-plano-500 dark:focus:bg-white/10 w-full"
                     />
                     <input
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="customer@example.com"
                        className="h-11 rounded-lg border border-border dark:border-sidebar-hover bg-white dark:bg-bg-page text-text-primary px-3 text-sm outline-none focus:border-plano-500 dark:focus:bg-white/10 w-full"
                     />
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2">
                     <button
                        type="button"
                        onClick={() => {
                           if (isInviting) return;
                           setShowInviteModal(false);
                        }}
                        className="h-10 rounded-lg border border-border dark:border-sidebar-hover bg-bg-page px-4 text-sm font-semibold text-text-secondary hover:bg-sidebar-hover transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        disabled={isInviting}
                        onClick={inviteCustomer}
                        className="h-10 rounded-lg bg-plano-600 px-4 text-sm font-semibold text-white hover:bg-plano-700 disabled:opacity-60"
                     >
                        {isInviting ? 'Sending...' : 'Send Invitation'}
                     </button>
                  </div>
               </div>
            </div>
         ) : null}

         {userPendingDelete ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="w-full max-w-md rounded-2xl border border-border dark:border-sidebar-hover bg-bg-surface shadow-2xl p-6">
                  <h2 className="text-xl font-bold text-text-primary">Delete User</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                     Delete {userPendingDelete.name} ({userPendingDelete.email})? This action cannot be undone from the dashboard.
                  </p>

                  <div className="mt-6 flex items-center justify-end gap-2">
                     <button
                        type="button"
                        disabled={deletingUserId === userPendingDelete._id}
                        onClick={() => setUserPendingDelete(null)}
                        className="h-10 rounded-lg border border-border dark:border-sidebar-hover bg-bg-page px-4 text-sm font-semibold text-text-secondary hover:bg-sidebar-hover transition-colors disabled:opacity-50"
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        disabled={deletingUserId === userPendingDelete._id}
                        onClick={() => deleteUser(userPendingDelete)}
                        className="h-10 rounded-lg bg-danger-600 px-4 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-60"
                     >
                        {deletingUserId === userPendingDelete._id ? 'Deleting...' : 'Delete User'}
                     </button>
                  </div>
               </div>
            </div>
         ) : null}
      </div>
   );
}
