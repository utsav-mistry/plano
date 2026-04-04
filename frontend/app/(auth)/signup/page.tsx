'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
    { label: 'Special character', valid: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.valid).length;
  const colors = ['#ef4444', '#f59e0b', '#a97096', '#714b67'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;
  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-1 h-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 rounded-full transition-all duration-500"
            style={{ background: i < score ? colors[score - 1] : '#e1c8d9' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map(c => (
            <span key={c.label} className="flex items-center gap-1 text-[10px] font-bold">
              {c.valid
                ? <Check size={10} style={{ color: '#714b67' }} />
                : <X size={10} className="text-gray-300" />}
              <span style={{ color: c.valid ? '#714b67' : '#a8a39c' }}>{c.label}</span>
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: colors[score - 1] }}>{labels[score - 1]}</span>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { register } = useAuth();
  const { error: toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(form);
    } catch (err: any) {
      toastError('Registration failed', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
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
          Create your account
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Start managing subscriptions in minutes
        </p>
      </div>


      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" suppressHydrationWarning>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase font-bold tracking-widest" style={{ color: '#714b67' }}>
            Full Name
          </label>
          <input
            suppressHydrationWarning
            type="text"
            required
            placeholder="Ravi Mistry"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all"
            style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
            onFocus={e => e.target.style.borderColor = '#714b67'}
            onBlur={e => e.target.style.borderColor = '#e1c8d9'}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase font-bold tracking-widest" style={{ color: '#714b67' }}>
            Work Email
          </label>
          <input
            suppressHydrationWarning
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="h-11 px-4 rounded-lg border text-sm font-medium outline-none transition-all"
            style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
            onFocus={e => e.target.style.borderColor = '#714b67'}
            onBlur={e => e.target.style.borderColor = '#e1c8d9'}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase font-bold tracking-widest" style={{ color: '#714b67' }}>
            Password
          </label>
          <div className="relative">
            <input
              suppressHydrationWarning
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full h-11 px-4 pr-12 rounded-lg border text-sm font-medium outline-none transition-all"
              style={{ borderColor: '#e1c8d9', background: '#f8f2f6', color: '#2a1a27' }}
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
          <PasswordStrength password={form.password} />
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
            <>Create Account <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-bold underline" style={{ color: '#714b67' }}>
          Sign in instead
        </Link>
      </p>
    </div>
  );
}
