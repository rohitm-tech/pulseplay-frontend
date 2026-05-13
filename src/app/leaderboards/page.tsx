'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { AuthGate } from '@/components/AuthGate';
import api from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLeaderboard, type LeaderboardRow } from '@/store/leaderboard/leaderboardSlice';

export default function LeaderboardsPage() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector((s) => s.leaderboard.rows);

  useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await api.get<{ data: LeaderboardRow[] }>('/api/leaderboard');
      dispatch(setLeaderboard(res.data.data));
      return res.data.data;
    },
  });

  return (
    <AuthGate>
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <h1 className="text-3xl font-semibold">Leaderboards</h1>
          <p className="text-sm text-slate-400">XP, streaks, and prediction hits.</p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Fan</th>
                  <th className="px-4 py-3">XP</th>
                  <th className="px-4 py-3">Correct</th>
                  <th className="px-4 py-3">Streak</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r._id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">
                      {(r.userId as { name?: string })?.name ?? 'Player'}
                    </td>
                    <td className="px-4 py-3 text-flood-300">{r.xp}</td>
                    <td className="px-4 py-3">{r.correctPredictions}</td>
                    <td className="px-4 py-3">{r.streak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
