'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

type Persisted = { _persist?: { rehydrated: boolean } };

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const rehydrated = useAppSelector((s) => (s as Persisted)._persist?.rehydrated ?? false);

  useEffect(() => {
    if (!rehydrated) return;
    if (!accessToken) router.replace('/login');
  }, [accessToken, rehydrated, router]);

  if (!rehydrated || !accessToken) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
