'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              NK<span className="text-neutral-400">Stech</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-neutral-500 mt-2">Enter your email to receive a reset link</p>
        </div>
        <div className="border border-neutral-800 rounded-2xl p-8 bg-neutral-900/50">
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-4">Check your email for the reset link.</p>
              <Link href="/login"><Button variant="secondary" className="bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700">Back to Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500" required />
              </div>
              <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
          <Link href="/login" className="flex items-center gap-2 text-sm text-neutral-500 mt-6 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
      </motion.div>
      <p className="absolute bottom-6 text-xs text-neutral-600">
        Created by NKStech
      </p>
    </div>
  );
}
