'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import LoginForm from './LoginForm';

function LoginContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || undefined;

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
