'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/matches', label: 'Live' },
  { href: '/leaderboards', label: 'Leaderboards' },
  { href: '/profile', label: 'Profile', auth: true as const },
  { href: '/admin', label: 'Admin', admin: true as const },
];

export function Header({ className }: { className?: string }) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.accessToken);

  useEffect(() => setMounted(true), []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b border-ink-200/60 bg-white/85 backdrop-blur-xl dark:border-ink-800/60 dark:bg-ink-950/85',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-ink-900 text-sm font-bold text-ink-50 shadow-soft transition group-hover:scale-105 dark:border-ink-700 dark:bg-ink-50 dark:text-ink-950">
            P
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-50">PulsePlay</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav
            .filter((item) => {
              if (item.auth && !token) return false;
              if (item.admin && user?.role !== 'admin') return false;
              return true;
            })
            .map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-ink-900 text-ink-50 dark:bg-ink-100 dark:text-ink-950'
                      : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-900 dark:hover:text-ink-50'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/matches"
            className="hidden items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-800 transition hover:border-ink-300 sm:inline-flex dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:hover:border-ink-500"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink-900 opacity-30 dark:bg-ink-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ink-900 dark:bg-ink-50" />
            </span>
            IPL
          </Link>

          {mounted && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          <div className="hidden md:block">
            {token ? (
              <Link href="/matches">
                <Button size="sm">Arena</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-200/60 bg-white/95 py-4 dark:border-ink-800/60 dark:bg-ink-950/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4">
            {nav
              .filter((item) => {
                if (item.auth && !token) return false;
                if (item.admin && user?.role !== 'admin') return false;
                return true;
              })
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-900"
                >
                  {item.label}
                </Link>
              ))}
            <Link href="/matches" className="mt-2" onClick={() => setOpen(false)}>
              <Button className="w-full" size="sm">
                {token ? 'Open arena' : 'Browse matches'}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
