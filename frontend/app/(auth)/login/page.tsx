
import LoginForm from './LoginForm';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { defaultRouteForRole } from '@/lib/role-routing';

function LoginContent() {
  const { login, user, isLoading: authLoading } = useAuth();
  const { error: toastError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || undefined;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-[#714b67]" />
                    <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-widest">Loading login...</p>
                </div>
            }
        >
            <LoginForm nextPath={nextPath} />
        </Suspense>
    );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-[#714b67]" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
