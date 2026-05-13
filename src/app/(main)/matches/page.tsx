'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { isAxiosError } from 'axios';
import { RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { MatchSummary } from '@/store/matches/matchesSlice';
import { useAppSelector } from '@/store/hooks';

type LiveMatchesResponse = { data: MatchSummary[]; updatedAt?: string | null };

async function fetchLiveMatches(forYou: boolean): Promise<{ matches: MatchSummary[]; updatedAt: string | null }> {
  const url = forYou ? '/api/matches/feed/for-you' : '/api/matches/live';
  const res = await api.get<LiveMatchesResponse>(url);
  return { matches: res.data.data, updatedAt: res.data.updatedAt ?? null };
}

export default function MatchesPage() {
  const [forYou, setForYou] = useState(false);
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['matches', forYou ? 'for-you' : 'live'],
    enabled: !forYou || !!accessToken,
    queryFn: () => fetchLiveMatches(forYou),
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<LiveMatchesResponse>('/api/matches/live/refresh');
      return { matches: res.data.data, updatedAt: res.data.updatedAt ?? null };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });

  const loadErrorMessage =
    isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
      ? String((error.response.data as { message?: string }).message)
      : isAxiosError(error)
        ? error.message
        : null;

  const refreshErrorMessage =
    isAxiosError(refreshMutation.error) &&
    refreshMutation.error.response?.data &&
    typeof refreshMutation.error.response.data === 'object' &&
    'message' in refreshMutation.error.response.data
      ? String((refreshMutation.error.response.data as { message?: string }).message)
      : isAxiosError(refreshMutation.error)
        ? refreshMutation.error.message
        : null;

  const matches = data?.matches ?? [];
  const updatedAt = data?.updatedAt;

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <PageContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">Live hub</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">Live matches</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-600 dark:text-ink-400">
              Matches are loaded from MongoDB. CricAPI runs only when you use Refresh (set CRIC_API_KEY on the backend).
              “For you” reorders the same snapshot by your favorite team from profile.
            </p>
            {updatedAt ? (
              <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">Last snapshot: {new Date(updatedAt).toLocaleString()}</p>
            ) : (
              <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">No snapshot yet — press Refresh to pull from CricAPI.</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={refreshMutation.isPending}
              className="gap-2"
              onClick={() => refreshMutation.mutate()}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh from API
            </Button>
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
        {refreshMutation.isError && refreshErrorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
            Refresh failed: {refreshErrorMessage}
          </div>
        ) : null}

        {!isLoading && !isError && matches.length === 0 ? (
          <p className="mt-8 text-sm text-ink-600 dark:text-ink-400">
            No matches in the database yet. Click “Refresh from API” to fetch the current list from CricAPI and store it.
          </p>
        ) : null}

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-ink-200/60 bg-ink-100/80 dark:border-ink-800/60 dark:bg-ink-900/40" />
            ))}
          {matches.map((m, idx) => (
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
