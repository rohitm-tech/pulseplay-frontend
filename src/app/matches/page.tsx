'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Header } from '@/components/Header';
import api from '@/lib/api';
import type { MatchSummary } from '@/store/matches/matchesSlice';
import { motion } from 'framer-motion';

export default function MatchesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: async () => {
      const res = await api.get<{ data: MatchSummary[] }>('/api/matches/live');
      return res.data.data;
    },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Live IPL hub</h1>
            <p className="text-sm text-slate-400">Powered by CricAPI with graceful mock fallbacks.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-panel h-32 animate-pulse bg-white/5" />
            ))}
          {data?.map((m, idx) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Link href={`/match/${m.id}`} className="block glass-panel p-5 transition hover:border-flood-500/40">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{m.name}</h2>
                  <span className="rounded-full bg-flood-500/15 px-3 py-1 text-xs text-flood-300">{m.status}</span>
                </div>
                {m.venue && <p className="mt-2 text-sm text-slate-400">{m.venue}</p>}
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
