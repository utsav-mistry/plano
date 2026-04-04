'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const initialEmail = searchParams.get('email') || '';
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('Verifying your email...');
    const [email, setEmail] = useState(initialEmail);
    const [isResending, setIsResending] = useState(false);
    const { success: toastSuccess, error: toastError } = useToast();

    useEffect(() => {
        async function verify() {
            if (!token) {
                setStatus('idle');
                setMessage(searchParams.get('registered') === '1'
                    ? 'Your account is created. Check your inbox for the verification link.'
                    : 'Enter your email to resend the verification link.');
                return;
            }

            setStatus('loading');
            try {
                const res = await api.auth.verifyEmail({ token });
                if (res.success) {
                    setStatus('success');
                    setMessage('Your email has been verified successfully.');
                    setTimeout(() => router.push('/login?verified=1'), 1800);
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'Verification link is invalid or expired.');
            }
        }

        verify();
    }, [router, token]);

    const handleResend = async () => {
        if (!email) {
            toastError('Missing email', 'Enter the email address used for signup.');
            return;
        }

        setIsResending(true);
        try {
            const res = await api.auth.sendVerificationEmail({ email });
            if (res.success) {
                toastSuccess('Verification sent', 'Check your inbox for a fresh verification link.');
                setStatus('idle');
                setMessage('Verification email sent. Check your inbox.');
            }
        } catch (err: any) {
            toastError('Unable to send', err.message || 'Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-3xl border border-[#e1c8d9] bg-white shadow-[0_24px_70px_rgba(113,75,103,0.14)] p-8 text-center">
                <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#f8f2f6', color: '#714b67' }}>
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : status === 'success' ? <CheckCircle2 size={34} /> : <MailWarning size={34} />}
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#2a1a27' }}>Email Verification</h1>
                <p className="text-sm mb-6" style={{ color: '#7a6b73' }}>{message}</p>
                {status !== 'loading' && (
                    <div className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all"
                            style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
                            onFocus={(e) => (e.target.style.borderColor = '#714b67')}
                            onBlur={(e) => (e.target.style.borderColor = '#e1c8d9')}
                        />
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
                            style={{ background: isResending ? '#a97096' : '#714b67' }}
                        >
                            {isResending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                            Resend verification email
                        </button>
                        <Link href="/login" className="h-11 rounded-xl flex items-center justify-center font-bold text-white" style={{ background: '#5a3c53' }}>
                            Go to Login
                        </Link>
                        <Link href="/signup" className="text-xs font-bold underline" style={{ color: '#714b67' }}>
                            Create another account
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}