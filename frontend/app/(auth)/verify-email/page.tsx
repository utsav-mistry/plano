'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MailWarning,
  Mail,
  Send,
  ShieldCheck,
  FileText,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';
  const isRegistered = searchParams.get('registered') === '1';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState(initialEmail);
  const [isResending, setIsResending] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('idle');
        if (isRegistered) {
          setMessage('Check your inbox! We\'ve sent a verification link to your email.');
        } else {
          setMessage('Enter your email to resend the verification link.');
        }
        return;
      }

      setStatus('loading');
      try {
        const res = await api.auth.verifyEmail({ token });
        if (res.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully.');

          // For token-based verification, show the agreement modal after a success beat
          setTimeout(() => {
            setShowAgreement(true);
          }, 800);
        }
      } catch (err: unknown) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification link is invalid or expired.');
      }
    }

    verify();
  }, [router, token, isRegistered, searchParams]);

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
    } catch (err: unknown) {
      toastError('Unable to send', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleAgreeAndContinue = () => {
    window.location.href = '/login?verified=1';
  };

  return (
    <div className="flex flex-col gap-6 text-center">
      {/* Agreement Modal */}
      {showAgreement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-plano-950/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShieldCheck size={32} />
            </div>

            <h2 className="font-serif text-2xl font-bold text-plano-900 mb-2">Almost there!</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              To complete your setup and dive into Plano, please review and accept our updated terms of service.
            </p>

            <div className="flex flex-col gap-3 mb-8">
              <Link href="/privacy-policy" target="_blank" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-plano-50 hover:border-plano-200 transition-all group">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-plano-600" />
                  <span className="text-xs font-bold text-plano-900 uppercase tracking-widest text-left">Privacy Policy</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-plano-400 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link href="/terms-of-service" target="_blank" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-plano-50 hover:border-plano-200 transition-all group cursor-pointer">
                <div className="flex items-center gap-3">
                  <UserCheck size={18} className="text-plano-600" />
                  <span className="text-xs font-bold text-plano-900 uppercase tracking-widest text-left">Terms of Service</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-plano-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            <button
              onClick={handleAgreeAndContinue}
              className="w-full h-14 rounded-xl bg-plano-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
            >
              Agree and Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Icon Area */}
      <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all" style={{ background: '#f8f2f6', color: '#714b67' }}>
        {status === 'loading' ? (
          <Loader2 className="animate-spin" size={34} />
        ) : status === 'success' ? (
          <CheckCircle2 size={34} className="text-green-500" />
        ) : isRegistered && status === 'idle' ? (
          <Mail size={34} />
        ) : (
          <MailWarning size={34} />
        )}
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h1
          style={{
            fontFamily: '"Caveat", cursive',
            fontSize: '2.4rem',
            fontWeight: 700,
            color: '#714b67',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
          }}
        >
          {status === 'success' ? 'Verified!' : isRegistered && status === 'idle' ? 'Check your Email' : 'Email Verification'}
        </h1>
        <p className="text-sm text-gray-500 font-medium px-2 leading-relaxed">
          {message}
        </p>

        {isRegistered && status === 'idle' && email && (
          <p className="text-[13px] font-bold mt-1" style={{ color: '#714b67' }}>{email}</p>
        )}
      </div>

      {status === 'success' && !showAgreement && (
        <div className="flex flex-col items-center gap-4 py-4">
          <Loader2 className="animate-spin text-gray-400" size={24} />
          <p className="text-xs text-gray-400">Finalizing verification...</p>
        </div>
      )}

      {status !== 'loading' && status !== 'success' && (
        <div className="flex flex-col gap-4">
          {/* Only show input if NOT in initial registration mode, or if they want to change it */}
          {(!isRegistered || status === 'error') && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[11px] uppercase font-bold tracking-widest pl-1" style={{ color: '#714b67' }}>
                Email Address
              </label>
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
            </div>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="flex items-center justify-center gap-2 h-12 rounded-lg text-white font-bold text-sm uppercase tracking-widest transition-all shadow-lg"
            style={{
              background: isResending ? '#a97096' : '#714b67',
              boxShadow: '0 4px 20px rgba(113,75,103,0.35)',
            }}
            onMouseEnter={e => !isResending && ((e.target as HTMLElement).style.background = '#5a3c53')}
            onMouseLeave={e => !isResending && ((e.target as HTMLElement).style.background = '#714b67')}
          >
            {isResending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {isRegistered && status === 'idle' ? 'Resend verification email' : 'Send verification link'}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center h-11 rounded-lg border text-sm font-bold transition-all transition-colors"
            style={{ borderColor: '#e1c8d9', color: '#714b67' }}
          >
            Back to Login
          </Link>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-xs text-gray-500 font-medium">
        Need help?{' '}
        <Link href="/contact" className="font-bold underline" style={{ color: '#714b67' }}>
          Contact support
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center gap-4 min-h-[200px]">
        <Loader2 className="animate-spin text-[#714b67]" size={40} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}