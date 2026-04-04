'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { defaultRouteForRole } from '@/lib/role-routing';

type LoginFormProps = {
    nextPath?: string;
};

function LoginFormContent({ nextPath }: LoginFormProps) {
    const { login, user, isLoading: authLoading } = useAuth();
    const { error: toastError } = useToast();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    useEffect(() => {
        if (!authLoading && user) {
            router.push(defaultRouteForRole(user?.role));
        }
    }, [user, authLoading, router]);

    const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Please check your credentials and try again.';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(form, nextPath);
        } catch (error: unknown) {
            toastError('Login failed', getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || user) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-[#714b67]" />
                <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-widest">Checking session...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-center">
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
                    Welcome back
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                    Sign in to your Plano account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" suppressHydrationWarning>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold tracking-widest" style={{ color: '#714b67' }}>
                        Email Address
                    </label>
                    <input
                        suppressHydrationWarning
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all"
                        style={{
                            borderColor: '#e1c8d9',
                            background: '#f8f2f6',
                            color: '#2a1a27',
                        }}
                        onFocus={e => e.target.style.borderColor = '#714b67'}
                        onBlur={e => e.target.style.borderColor = '#e1c8d9'}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] uppercase font-bold tracking-widest" style={{ color: '#714b67' }}>
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-[11px] font-bold underline" style={{ color: '#714b67' }}>
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            suppressHydrationWarning
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            className="w-full h-11 px-4 pr-12 rounded-lg border text-sm font-medium outline-none transition-all"
                            style={{
                                borderColor: '#e1c8d9',
                                background: '#f8f2f6',
                                color: '#2a1a27',
                            }}
                            onFocus={e => e.target.style.borderColor = '#714b67'}
                            onBlur={e => e.target.style.borderColor = '#e1c8d9'}
                        />
                        <button
                            suppressHydrationWarning
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: '#a97096' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 h-12 rounded-lg text-white font-bold text-sm uppercase tracking-widest transition-all shadow-lg mt-2"
                    style={{
                        background: isLoading ? '#a97096' : '#714b67',
                        boxShadow: '0 4px 20px rgba(113,75,103,0.35)',
                    }}
                    onMouseEnter={e => !isLoading && ((e.target as HTMLElement).style.background = '#5a3c53')}
                    onMouseLeave={e => !isLoading && ((e.target as HTMLElement).style.background = '#714b67')}
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>Sign In <ArrowRight size={16} /></>
                    )}
                </button>
            </form>

            <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: '#e1c8d9' }} />
                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#a97096' }}>or</span>
                <div className="flex-1 h-px" style={{ background: '#e1c8d9' }} />
            </div>

            <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-bold underline" style={{ color: '#714b67' }}>
                    Create one free
                </Link>
            </p>
        </div>
    );
}

export default function LoginForm({ nextPath }: LoginFormProps) {
    return <LoginFormContent nextPath={nextPath} />;
}
