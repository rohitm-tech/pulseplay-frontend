'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { isAxiosError } from 'axios';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { MatchSummary } from '@/store/matches/matchesSlice';
import { useAppSelector } from '@/store/hooks';

export default function MatchesPage() {
  const [forYou, setForYou] = useState(false);
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['matches', forYou ? 'for-you' : 'live'],
    enabled: !forYou || !!accessToken,
    queryFn: async () => {
      const url = forYou ? '/api/matches/feed/for-you' : '/api/matches/live';
      const res = await api.get<{ data: MatchSummary[] }>(url);
      return res.data.data;
    },
  });

  const loadErrorMessage =
    isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
      ? String((error.response.data as { message?: string }).message)
      : isAxiosError(error)
        ? error.message
        : null;

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <PageContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">Live hub</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">Live matches</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-600 dark:text-ink-400">
              Every current match from CricAPI (set CRIC_API_KEY on the backend). “For you” only reorders the same list by
              your favorite team from profile.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant={forYou ? 'default' : 'outline'} onClick={() => setForYou(true)}>
              For you
            </Button>
            <Button type="button" size="sm" variant={!forYou ? 'default' : 'outline'} onClick={() => setForYou(false)}>
              All live
            </Button>
          </div>
        </div>
        {isError && loadErrorMessage ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
            {loadErrorMessage}
          </div>
        ) : null}

        {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
          <p className="mt-8 text-sm text-ink-600 dark:text-ink-400">No current matches returned by CricAPI right now.</p>
        ) : null}

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
      </PageContainer>
    </div>
  );
}
