'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthGate } from '@/components/AuthGate';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { claimAchievementsRequest } from '@/services/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/auth/authSlice';
import { toast } from 'sonner';

type TriviaPayload = { id: string; question: string; options: string[]; category: string };

export default function FeaturesPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [pick, setPick] = useState<string | null>(null);

  const trivia = useQuery({
    queryKey: ['trivia'],
    enabled: !!token,
    queryFn: async () => {
      const res = await api.get<{ data: TriviaPayload }>('/api/features/trivia');
      return res.data.data;
    },
  });

  const achievements = useQuery({
    queryKey: ['achievements'],
    enabled: !!token,
    queryFn: async () => {
      const res = await api.get<{ data: { definitions: { id: string; title: string; description: string; icon: string }[]; unlocked: string[] } }>(
        '/api/users/me/achievements'
      );
      return res.data.data;
    },
  });

  const claim = useMutation({
    mutationFn: claimAchievementsRequest,
    onSuccess: (user) => {
      dispatch(setUser(user));
      toast.success('Badges synced to your profile.');
    },
    onError: () => toast.error('Could not claim badges'),
  });

  const verify = useMutation({
    mutationFn: async () => {
      if (!trivia.data || !pick) throw new Error('pick');
      const res = await api.post<{ data: { correct: boolean; answer?: string } }>('/api/features/trivia/verify', {
        id: trivia.data.id,
        choice: pick,
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      toast(data.correct ? 'Correct!' : `Not quite — ${data.answer ?? ''}`);
    },
    onError: () => toast.error('Verify failed'),
  });

  return (
    <AuthGate>
      <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
        <PageContainer>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">Fan hub</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">Trivia & achievements</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-600 dark:text-ink-400">
            Lightweight engagement on top of your existing auth, polls, and XP — no extra infrastructure.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>Cricket trivia</CardTitle>
              <CardDescription>Random question — vote then check the answer.</CardDescription>
              {trivia.data ? (
                <div className="mt-4 space-y-3">
                  <p className="text-xs uppercase text-ink-500">{trivia.data.category}</p>
                  <p className="text-sm font-medium text-ink-900 dark:text-ink-50">{trivia.data.question}</p>
                  <div className="flex flex-wrap gap-2">
                    {trivia.data.options.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setPick(o)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          pick === o
                            ? 'border-ink-900 bg-ink-900 text-white dark:border-ink-100 dark:bg-ink-100 dark:text-ink-950'
                            : 'border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" disabled={!pick || verify.isPending} onClick={() => verify.mutate()}>
                      Check answer
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void trivia.refetch()}>
                      New question
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-500">Loading…</p>
              )}
            </Card>

            <Card>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Unlocked from your XP, streak, predictions, and follows — sync as profile badges.</CardDescription>
              <div className="mt-4 space-y-3">
                {achievements.data?.definitions.map((d) => {
                  const on = achievements.data.unlocked.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      className={`flex gap-3 rounded-xl border p-3 text-sm ${
                        on ? 'border-ink-900/30 bg-ink-50 dark:border-ink-500/30 dark:bg-ink-900/40' : 'border-ink-200/80 opacity-70 dark:border-ink-800/80'
                      }`}
                    >
                      <span className="text-2xl">{d.icon}</span>
                      <div>
                        <p className="font-semibold text-ink-900 dark:text-ink-50">{d.title}</p>
                        <p className="text-ink-600 dark:text-ink-400">{d.description}</p>
                        {on ? <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">Unlocked</p> : null}
                      </div>
                    </div>
                  );
                })}
                <Button type="button" size="sm" variant="outline" disabled={claim.isPending} onClick={() => claim.mutate()}>
                  Sync badges to profile
                </Button>
              </div>
            </Card>
          </div>
        </PageContainer>
      </div>
    </AuthGate>
  );
}
