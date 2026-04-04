'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const token = Array.isArray(params.token) ? params.token[0] : (params.token as string);
    const { success, error: toastError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ password: '', confirmPassword: '' });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!token) {
            toastError('Missing token', 'The reset link is incomplete.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            toastError('Validation', 'Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.auth.resetPassword(token, { password: form.password, confirmPassword: form.confirmPassword });
            if (res.success) {
                success('Password updated', 'You can now sign in with your new password.');
                router.push('/login');
            }
        } catch (err: any) {
            toastError('Reset failed', err.message || 'Please request a new reset link.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-center">
                <div className="mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#f8f2f6', color: '#714b67' }}>
                    <Lock size={28} />
                </div>
                <h1 style={{ fontFamily: '"Caveat", cursive', fontSize: '2.4rem', fontWeight: 700, color: '#714b67', lineHeight: 1.1 }}>
                    Choose a new password
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                    This page uses the same theme as the rest of the Plano auth flow.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" suppressHydrationWarning>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold tracking-widest" style={{ color: '#714b67' }}>
                        New Password
                    </label>
                    <input
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                        className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all"
                        style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold tracking-widest" style={{ color: '#714b67' }}>
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        required
                        value={form.confirmPassword}
                        onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                        className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all"
                        style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 h-12 rounded-lg text-white font-bold text-sm uppercase tracking-widest transition-all shadow-lg mt-2"
                    style={{ background: isLoading ? '#a97096' : '#714b67', boxShadow: '0 4px 20px rgba(113,75,103,0.35)' }}
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Reset Password
                </button>
            </form>

            <p className="text-center text-sm text-gray-500">
                <Link href="/login" className="font-bold underline" style={{ color: '#714b67' }}>
                    Back to login
                </Link>
            </p>
        </div>
    );
}