'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authAPI } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="glass rounded-2xl p-12 text-center max-w-md">
      <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && (
        <>
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Email Verified!</h1>
          <p className="text-muted-foreground mb-6">Your account is now active.</p>
          <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Verification Failed</h1>
          <p className="text-muted-foreground mb-6">Invalid or expired verification link.</p>
          <Link href="/login"><Button variant="secondary">Back to Login</Button></Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-6">
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
