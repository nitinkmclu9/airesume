'use client';

import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://airesume-j8hi.onrender.com/api';

const HEALTH_URL = API_URL.replace(/\/api$/, '') + '/api/health';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const warmupResolve = useRef<(() => void) | null>(null);
  const [warmupDone, setWarmupDone] = useState(false);
  const pendingSubmit = useRef(false);

  const warmup = useCallback(async () => {
    if (warmupResolve.current) return;

    const p = new Promise<void>((resolve) => {
      warmupResolve.current = resolve;
    });

    fetch(HEALTH_URL, { mode: 'cors' })
      .then(() => setWarmupDone(true))
      .catch(() => {})
      .finally(() => warmupResolve.current?.());

    try {
      await p;
    } catch {}
  }, []);

  useEffect(() => {
    warmup();
  }, [warmup]);

  const doLogin = async () => {
    setLoading(true);

    try {
      await login(email, password);

      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        error.response?.data?.message || 'Login failed'
      );
    } finally {
      setLoading(false);
      setShowProgress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (warmupDone) {
      doLogin();
    } else {
      pendingSubmit.current = true;
      setShowProgress(true);

      const poll = setInterval(() => {
        if (warmupDone) {
          clearInterval(poll);
          setShowProgress(false);

          if (pendingSubmit.current) {
            doLogin();
          }
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(poll);
        setShowProgress(false);
        pendingSubmit.current = false;
        doLogin();
      }, 35000);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: any
  ) => {
    try {
      const res = await axios.post(
        `${API_URL}/auth/google`,
        {
          credential: credentialResponse.credential,
        }
      );

      localStorage.setItem('token', res.data.token);

      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Google Login Failed');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-6"
          >
            <span className="text-3xl font-extrabold tracking-tight text-white">
              NK<span className="text-neutral-400">Stech</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-white">
            Welcome back
          </h1>

          <p className="text-neutral-500 mt-2">
            Sign in to your account
          </p>
        </div>

        <div className="border border-neutral-800 rounded-2xl p-8 bg-neutral-900/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-neutral-300">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />

                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-neutral-300">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />

                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-neutral-200"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}

              {!loading && (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-700" />

            <span className="px-3 text-sm text-gray-400">
              OR
            </span>

            <div className="flex-1 border-t border-gray-700" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                toast.error('Google Login Failed')
              }
            />
          </div>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-neutral-300 hover:text-white transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>

      {showProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => {}}
          />

          <div className="relative w-full max-w-sm border border-neutral-800 rounded-2xl bg-neutral-900 p-8 text-center">
            <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />

            <h3 className="text-lg font-semibold text-white mb-2">
              Waking up server...
            </h3>

            <p className="text-sm text-neutral-500 mb-4">
              The server was asleep. This takes about 15-30 seconds.
            </p>

            <div className="w-full bg-neutral-800 rounded-full h-1.5 mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 30,
                  ease: 'linear',
                }}
              />
            </div>

            <p className="text-xs text-neutral-600">
              You&apos;ll be signed in automatically once ready.
            </p>
          </div>
        </div>
      )}

      <p className="absolute bottom-6 text-xs text-neutral-600">
        Created by NKStech
      </p>
    </div>
  );
}