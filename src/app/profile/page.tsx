'use client';

import { Header } from '@/components/Header';
import { AuthGate } from '@/components/AuthGate';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/auth/authSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <AuthGate>
      <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
        <Header />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
          <Card>
            <CardTitle>Profile</CardTitle>
            <CardDescription>JWT session — Redux Persist keeps tokens locally.</CardDescription>
            <dl className="mt-8 space-y-4 text-sm">
              <div className="flex justify-between gap-4 border-b border-ink-100 pb-3 dark:border-ink-800">
                <dt className="text-ink-500 dark:text-ink-400">Name</dt>
                <dd className="font-medium text-ink-900 dark:text-ink-50">{user?.name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-ink-100 pb-3 dark:border-ink-800">
                <dt className="text-ink-500 dark:text-ink-400">Email</dt>
                <dd className="font-medium text-ink-900 dark:text-ink-50">{user?.email}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-ink-100 pb-3 dark:border-ink-800">
                <dt className="text-ink-500 dark:text-ink-400">Team</dt>
                <dd className="font-medium text-ink-900 dark:text-ink-50">{user?.favoriteTeam ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-ink-100 pb-3 dark:border-ink-800">
                <dt className="text-ink-500 dark:text-ink-400">XP</dt>
                <dd className="font-medium text-ink-900 dark:text-ink-50">{user?.xpPoints}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-ink-100 pb-3 dark:border-ink-800">
                <dt className="text-ink-500 dark:text-ink-400">Role</dt>
                <dd className="font-medium text-ink-900 dark:text-ink-50">{user?.role}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500 dark:text-ink-400">Badges</dt>
                <dd className="text-right font-medium text-ink-900 dark:text-ink-50">{user?.badges?.join(', ') || '—'}</dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="outline"
              className="mt-10 w-full sm:w-auto"
              onClick={() => {
                dispatch(logout());
                router.push('/');
              }}
            >
              Log out
            </Button>
          </Card>
        </main>
      </div>
    </AuthGate>
  );
}
