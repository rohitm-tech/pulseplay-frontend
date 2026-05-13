'use client';

import { Header } from '@/components/Header';
import { AuthGate } from '@/components/AuthGate';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/auth/authSlice';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <AuthGate>
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="glass-panel p-8">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <div className="mt-6 space-y-3 text-sm text-slate-200">
              <p>
                <span className="text-slate-400">Name:</span> {user?.name}
              </p>
              <p>
                <span className="text-slate-400">Email:</span> {user?.email}
              </p>
              <p>
                <span className="text-slate-400">Team:</span> {user?.favoriteTeam ?? '—'}
              </p>
              <p>
                <span className="text-slate-400">XP:</span> {user?.xpPoints}
              </p>
              <p>
                <span className="text-slate-400">Role:</span> {user?.role}
              </p>
              <p>
                <span className="text-slate-400">Badges:</span> {user?.badges?.join(', ') || '—'}
              </p>
            </div>
            <button
              type="button"
              className="mt-8 rounded-full border border-white/20 px-6 py-2 text-sm text-slate-100"
              onClick={() => {
                dispatch(logout());
                router.push('/');
              }}
            >
              Log out
            </button>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
