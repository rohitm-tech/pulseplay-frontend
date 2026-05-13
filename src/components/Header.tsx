'use client';

import Link from 'next/link';
import { Flame, Trophy, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

export function Header({ className }: { className?: string }) {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.accessToken);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-white/10 bg-pitch-950/80 backdrop-blur-xl',
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-flood-500 to-teal-700 text-pitch-950 shadow-glow">
            <Flame className="h-5 w-5" />
          </span>
          <span className="text-lg">PulsePlay</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/matches" className="hover:text-white">
            Live
          </Link>
          <Link href="/leaderboards" className="hover:text-white">
            Leaderboards
          </Link>
          {token && (
            <Link href="/profile" className="hover:text-white">
              Profile
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className="inline-flex items-center gap-1 hover:text-white">
              <Trophy className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 rounded-full border border-flood-500/40 bg-flood-500/10 px-3 py-1.5 text-xs font-medium text-flood-400"
          >
            <Radio className="h-3.5 w-3.5 animate-pulse-live" />
            IPL Live
          </Link>
          {token ? (
            <Link
              href="/matches"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30"
            >
              Arena
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
