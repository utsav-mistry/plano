'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function VerifyOtpPage() {
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get('email') || '';
    const initialPurpose = (searchParams.get('purpose') as 'verify_email' | 'login' | null) || 'verify_email';
    const { error: toastError, success: toastSuccess } = useToast();
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({ email: initialEmail, otp: '', purpose: initialPurpose });

    const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Please try again.';

    useEffect(() => {
        if (form.email) {
            void handleSend(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSend = async (showToast = true) => {
        if (!form.email) {
            if (showToast) {
                toastError('Missing email', 'Enter the email address first.');
            }
            return;
        }

        setIsSending(true);
        try {
            const res = await api.auth.sendOtp({ email: form.email, purpose: form.purpose });
            if (res.success) {
                setSent(true);
                if (showToast) {
                    toastSuccess('OTP sent', 'Check your inbox for the one-time code.');
                }
            }
        } catch (error: unknown) {
            if (showToast) {
                toastError('Unable to send OTP', getErrorMessage(error));
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleVerify = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form.email || !form.otp) {
            toastError('Missing details', 'Email and OTP are required.');
            return;
        }

        setIsVerifying(true);
        try {
            const res = await api.auth.verifyOtp({ email: form.email, otp: form.otp, purpose: form.purpose });
            if (res.success) {
                toastSuccess('Verified', 'Your code was accepted.');
            }
        } catch (error: unknown) {
            toastError('Verification failed', getErrorMessage(error));
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-lg rounded-3xl border border-[#e1c8d9] bg-white shadow-[0_24px_70px_rgba(113,75,103,0.14)] p-8">
                <div className="text-center mb-6">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#f8f2f6', color: '#714b67' }}>
                        <CheckCircle2 size={34} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: '#2a1a27' }}>Verify OTP</h1>
                    <p className="text-sm" style={{ color: '#7a6b73' }}>Send a one-time code and confirm it here.</p>
                </div>

                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="you@company.com"
                        value={form.email}
                        onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                        className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all"
                        style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleSend(true)}
                            disabled={isSending}
                            className="h-11 px-4 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2"
                            style={{ background: '#714b67' }}
                        >
                            {isSending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                            Send OTP
                        </button>
                        <select
                            value={form.purpose}
                            onChange={(e) => setForm((current) => ({ ...current, purpose: e.target.value as 'verify_email' | 'login' }))}
                            className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all flex-1"
                            style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
                        >
                            <option value="verify_email">Email verification</option>
                            <option value="login">Login</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={form.otp}
                        onChange={(e) => setForm((current) => ({ ...current, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all tracking-[0.4em] text-center"
                        style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
                    />
                    <button
                        type="submit"
                        disabled={isVerifying}
                        className="h-12 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
                        style={{ background: '#5a3c53' }}
                    >
                        {isVerifying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        Verify Code
                    </button>
                    <p className="text-xs text-center" style={{ color: '#7a6b73' }}>
                        Need help? Contact support from the Plano site view.
                    </p>
                </form>

                {sent && (
                    <div className="mt-4 rounded-2xl border border-[#e1c8d9] bg-[#f8f2f6] px-4 py-3 text-xs font-medium text-[#5a3c53] text-center">
                        OTP sent. Use the latest code from your inbox.
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-xs font-bold underline" style={{ color: '#714b67' }}>
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}