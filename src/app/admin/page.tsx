'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { AuthGate } from '@/components/AuthGate';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Record<string, number> | null>(null);
  const [question, setQuestion] = useState('Will this over go above 15 runs?');
  const [matchId, setMatchId] = useState('mock-ipl-1');
  const [expires, setExpires] = useState(() => new Date(Date.now() + 3600000).toISOString().slice(0, 16));

  if (role !== 'admin') {
    return (
      <AuthGate>
        <div className="min-h-screen">
          <Header />
          <main className="px-4 py-16 text-center text-slate-400">Admin only.</main>
        </div>
      </AuthGate>
    );
  }

  async function loadAnalytics() {
    const res = await api.get('/api/admin/analytics');
    setAnalytics(res.data.data);
    toast.success('Analytics loaded');
  }

  async function createPoll() {
    try {
      await api.post('/api/polls', {
        question,
        options: ['Yes', 'No'],
        matchId,
        expiresAt: new Date(expires).toISOString(),
        correctAnswer: 'Yes',
      });
      toast.success('Poll created');
    } catch {
      toast.error('Failed to create poll');
    }
  }

  return (
    <AuthGate>
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Admin</h1>
            <button className="text-sm text-flood-400" type="button" onClick={() => router.push('/matches')}>
              Back to matches
            </button>
          </div>
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold">Analytics</h2>
            <button
              type="button"
              className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm"
              onClick={() => void loadAnalytics()}
            >
              Refresh
            </button>
            {analytics && (
              <pre className="mt-4 max-h-48 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-flood-200">
                {JSON.stringify(analytics, null, 2)}
              </pre>
            )}
          </div>
          <div className="glass-panel space-y-4 p-6">
            <h2 className="text-lg font-semibold">Manual poll</h2>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
            />
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
            />
            <button type="button" className="rounded-full bg-flood-500 px-6 py-2 text-sm font-semibold text-pitch-950" onClick={() => void createPoll()}>
              Publish poll
            </button>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
