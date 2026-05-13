'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/auth/authSlice';
import { registerRequest } from '@/services/authApi';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [team, setTeam] = useState('RCB');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await registerRequest({ name, email, password, favoriteTeam: team });
      dispatch(setCredentials(data));
      toast.success('Account ready');
      router.push('/matches');
    } catch {
      toast.error('Could not register');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="glass-panel p-8">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="mt-2 text-sm text-slate-400">Pick a side. Earn XP for bold calls.</p>
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-xs uppercase text-slate-400">Name</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-flood-500 focus:ring-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-400">Favorite team</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-flood-500 focus:ring-2"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
              >
                {['RCB', 'CSK', 'MI', 'KKR', 'SRH', 'DC', 'PBKS', 'RR', 'GT', 'LSG'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button
              disabled={loading}
              className="w-full rounded-full bg-flood-500 py-2 text-sm font-semibold text-pitch-950 disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Join PulsePlay'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-flood-400">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
