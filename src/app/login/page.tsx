'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/auth/authSlice';
import { loginRequest } from '@/services/authApi';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginRequest({ email, password });
      dispatch(setCredentials(data));
      toast.success('Welcome back');
      router.push('/matches');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="glass-panel p-8">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-slate-400">JWT access + refresh tokens issued on login.</p>
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-xs uppercase text-slate-400">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-flood-500 focus:ring-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-400">Password</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-flood-500 focus:ring-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full rounded-full bg-flood-500 py-2 text-sm font-semibold text-pitch-950 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Continue'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            New here?{' '}
            <Link href="/register" className="text-flood-400">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
