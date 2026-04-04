'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
    const { success, error: toastError } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Please try again.';

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!email) {
            toastError('Missing email', 'Enter the email address linked to your account.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.auth.forgotPassword({ email });
            if (res.success) {
                setSent(true);
                success('Check your inbox', 'If the account exists, a reset link was sent.');
            }
        } catch (error: unknown) {
            toastError('Request failed', getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-center">
                <div className="mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#f8f2f6', color: '#714b67' }}>
                    <Mail size={28} />
                </div>
                <h1 style={{ fontFamily: '"Caveat", cursive', fontSize: '2.4rem', fontWeight: 700, color: '#714b67', lineHeight: 1.1 }}>
                    Reset your password
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                    We&apos;ll send a themed reset email from no-reply.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" suppressHydrationWarning>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold tracking-widest" style={{ color: '#714b67' }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all"
                        style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
                        onFocus={(e) => (e.target.style.borderColor = '#714b67')}
                        onBlur={(e) => (e.target.style.borderColor = '#e1c8d9')}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 h-12 rounded-lg text-white font-bold text-sm uppercase tracking-widest transition-all shadow-lg mt-2"
                    style={{ background: isLoading ? '#a97096' : '#714b67', boxShadow: '0 4px 20px rgba(113,75,103,0.35)' }}
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={16} />}
                    Send reset link
                </button>
            </form>

            {sent && (
                <div className="rounded-2xl border border-[#e1c8d9] bg-[#f8f2f6] px-4 py-3 text-sm text-[#5a3c53] font-medium">
                    Reset email sent. If you also need verification or OTP help, use the links below.
                </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-center">
                <Link href="/verify-email" className="underline" style={{ color: '#714b67' }}>
                    Verify Email
                </Link>
                <span style={{ color: '#caaabf' }}>•</span>
                <Link href="/verify-otp" className="underline" style={{ color: '#714b67' }}>
                    OTP / 2FA
                </Link>
                <span style={{ color: '#caaabf' }}>•</span>
                <Link href="/login" className="underline" style={{ color: '#714b67' }}>
                    Login
                </Link>
            </div>

            <p className="text-center text-sm text-gray-500">
                Remembered it?{' '}
                <Link href="/login" className="font-bold underline" style={{ color: '#714b67' }}>
                    Back to login
                </Link>
            </p>
        </div>
    );
}