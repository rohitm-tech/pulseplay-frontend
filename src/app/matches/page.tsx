'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import api from '@/lib/api';
import type { MatchSummary } from '@/store/matches/matchesSlice';

export default function MatchesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: async () => {
      const res = await api.get<{ data: MatchSummary[] }>('/api/matches/live');
      return res.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">Live hub</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">IPL matches</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-600 dark:text-ink-400">
              CricAPI when configured; graceful mock slate otherwise. Tap a card for the full second-screen layout.
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-ink-200/60 bg-ink-100/80 dark:border-ink-800/60 dark:bg-ink-900/40" />
            ))}
          {data?.map((m, idx) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Link
                href={`/match/${m.id}`}
                className="group block rounded-2xl border border-ink-200/80 bg-white/80 p-6 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-ink-400 hover:shadow-soft-lg dark:border-ink-800/80 dark:bg-ink-950/55 dark:hover:border-ink-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-ink-900 transition group-hover:text-ink-950 dark:text-ink-50 dark:group-hover:text-white">
                    {m.name}
                  </h2>
                  <span className="shrink-0 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs font-medium text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200">
                    {m.status}
                  </span>
                </div>
                {m.venue && <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">{m.venue}</p>}
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-400 opacity-0 transition group-hover:opacity-100 dark:text-ink-500">
                  Open match room →
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
