'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { AuthGate } from '@/components/AuthGate';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setMatchDetail,
  setCommentary,
  type MatchSummary,
} from '@/store/matches/matchesSlice';
import { setPollsForMatch } from '@/store/polls/pollsSlice';
import { setMessages } from '@/store/chat/chatSlice';
import { setLeaderboard } from '@/store/leaderboard/leaderboardSlice';
import { usePulseSockets } from '@/hooks/usePulseSockets';
import api from '@/lib/api';
import { WormChart } from '@/components/match/WormChart';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

const REACTIONS = ['🔥', '😱', '👏', '💔', '🐐'];

export default function MatchPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const dispatch = useAppDispatch();
  const detail = useAppSelector((s) => s.matches.detail);
  const commentary = useAppSelector((s) => s.matches.commentary);
  const liveScore = useAppSelector((s) => s.matches.liveScoreById[matchId]);
  const polls = useAppSelector((s) => s.polls.byMatch[matchId] ?? []);
  const reactions = useAppSelector((s) => s.reactions.recent);
  const room = `match:${matchId}`;
  const chatMessages = useAppSelector((s) => s.chat.byRoom[room] ?? []);
  const typing = useAppSelector((s) => s.chat.typing[room] ?? []);
  const socketConnected = useAppSelector((s) => s.socket.connected);
  const user = useAppSelector((s) => s.auth.user);

  const { sendReaction, sendChat, sendTyping } = usePulseSockets(matchId);

  useQuery({
    queryKey: ['match', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const res = await api.get<{ data: MatchSummary }>(`/api/matches/${matchId}`);
      dispatch(setMatchDetail(res.data.data));
      return res.data.data;
    },
  });

  useQuery({
    queryKey: ['commentary', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const res = await api.get<{ data: typeof commentary }>(`/api/matches/${matchId}/commentary`);
      dispatch(setCommentary(res.data.data));
      return res.data.data;
    },
  });

  useQuery({
    queryKey: ['polls', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const res = await api.get(`/api/polls/match/${matchId}`);
      dispatch(setPollsForMatch({ matchId, polls: res.data.data }));
      return res.data.data;
    },
  });

  const { data: insights } = useQuery({
    queryKey: ['ai', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const res = await api.get(`/api/ai/match/${matchId}`);
      return res.data.data as { id: string; title: string; body: string; tone: string }[];
    },
  });

  useQuery({
    queryKey: ['chat', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const res = await api.get(`/api/chat/${matchId}`);
      const msgs = (res.data.data as { _id: string; userName: string; text: string; createdAt?: string }[]).map(
        (m) => ({
          id: m._id,
          userName: m.userName,
          text: m.text,
          createdAt: m.createdAt,
        })
      );
      dispatch(setMessages({ room, messages: msgs }));
      return msgs;
    },
  });

  useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await api.get('/api/leaderboard');
      dispatch(setLeaderboard(res.data.data));
      return res.data.data;
    },
  });

  const wormPoints = useMemo(() => {
    let acc = 0;
    return commentary.map((c, i) => {
      const ev = c.event as { runs?: number } | undefined;
      acc +=
        typeof ev?.runs === 'number'
          ? ev.runs
          : c.text.toLowerCase().includes('six')
            ? 6
            : c.text.toLowerCase().includes('four')
              ? 4
              : 1;
      return { over: c.over || String(i), runs: acc };
    });
  }, [commentary]);

  const [chatInput, setChatInput] = useState('');

  async function vote(pollId: string, option: string) {
    try {
      await api.post('/api/polls/vote', { pollId, option });
      toast.success('Vote recorded');
    } catch {
      toast.error('Vote failed');
    }
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">Match room</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                {detail?.name ?? 'Loading…'}
              </h1>
              {detail?.venue && <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">{detail.venue}</p>}
            </div>
            <div className="rounded-full border border-ink-200 bg-white/80 px-4 py-2 text-xs font-medium text-ink-600 shadow-soft dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-300">
              Socket:{' '}
              {socketConnected ? (
                <span className="text-ink-900 dark:text-ink-50">live</span>
              ) : (
                <span className="text-ink-500">connecting</span>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardTitle>Live score</CardTitle>
              <CardDescription>Payloads from `live_score_update` — subtle motion on change.</CardDescription>
              <motion.pre
                key={JSON.stringify(liveScore)}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="mt-4 max-h-48 overflow-auto rounded-xl border border-ink-200 bg-ink-50 p-4 text-xs text-ink-800 scrollbar-thin dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200"
              >
                {JSON.stringify(liveScore ?? detail?.score ?? {}, null, 2)}
              </motion.pre>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-200">Worm</h3>
                <WormChart points={wormPoints.length ? wormPoints : [{ over: '0', runs: 0 }]} />
              </div>
            </Card>

            <Card>
              <CardTitle>Reactions</CardTitle>
              <CardDescription>Tap — bursts fan out in the overlay.</CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                {REACTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => sendReaction(r)}
                    className="rounded-2xl border border-ink-200 bg-white px-3 py-2 text-2xl transition hover:-translate-y-0.5 hover:border-ink-400 hover:shadow-soft active:scale-95 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-ink-500"
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="relative mt-6 h-40 overflow-hidden rounded-xl border border-ink-200 bg-gradient-to-b from-ink-100 to-transparent dark:border-ink-800 dark:from-ink-900 dark:to-transparent">
                <AnimatePresence>
                  {reactions.slice(0, 14).map((rx) => (
                    <motion.span
                      key={rx.id}
                      initial={{ opacity: 0, y: 12, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute text-3xl"
                      style={{ left: `${(rx.ts % 75) + 8}%`, top: `${(rx.id.length * 9) % 55}%` }}
                    >
                      {rx.emoji}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardTitle>Commentary</CardTitle>
              <CardDescription>Structured events from the normalization engine.</CardDescription>
              <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-2 scrollbar-thin">
                {commentary.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-ink-200/80 bg-white/60 p-3 text-sm dark:border-ink-800/80 dark:bg-ink-900/40"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
                      Over {c.over}
                    </div>
                    <p className="mt-1 text-ink-900 dark:text-ink-100">{c.text}</p>
                    {c.event != null ? (
                      <p className="mt-2 font-mono text-xs text-ink-500 dark:text-ink-500">{JSON.stringify(c.event)}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardTitle>Polls</CardTitle>
                <CardDescription>Timed questions — XP on close (admin).</CardDescription>
                <div className="mt-4 space-y-3">
                  {polls.map((p) => (
                    <div key={p._id} className="rounded-xl border border-ink-200 bg-ink-50/80 p-3 dark:border-ink-800 dark:bg-ink-900/50">
                      <p className="text-sm font-medium text-ink-900 dark:text-ink-50">{p.question}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {p.options.map((o) => (
                          <Button key={o} type="button" size="sm" variant="outline" onClick={() => vote(p._id, o)}>
                            {o}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!polls.length && <p className="text-sm text-ink-500 dark:text-ink-400">No polls yet.</p>}
                </div>
              </Card>

              <Card>
                <CardTitle>AI insights</CardTitle>
                <CardDescription>Mock service — wire your provider later.</CardDescription>
                <div className="mt-3 space-y-3 text-sm">
                  {insights?.map((i) => (
                    <div key={i.id} className="rounded-lg border border-ink-200 bg-white/70 p-3 dark:border-ink-800 dark:bg-ink-900/50">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{i.tone}</p>
                      <p className="font-semibold text-ink-900 dark:text-ink-50">{i.title}</p>
                      <p className="text-ink-600 dark:text-ink-400">{i.body}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <Card className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Fan chat</CardTitle>
              {typing.length > 0 && <span className="text-xs text-ink-500 dark:text-ink-400">{typing.join(', ')} typing…</span>}
            </div>
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto scrollbar-thin">
              {chatMessages.map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="font-semibold text-ink-900 dark:text-ink-100">{m.userName}</span>{' '}
                  <span className="text-ink-700 dark:text-ink-300">{m.text}</span>
                </div>
              ))}
            </div>
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                sendChat(chatInput.trim());
                setChatInput('');
              }}
            >
              <input
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  sendTyping();
                }}
                className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none ring-ink-900/10 focus:ring-2 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50"
                placeholder={`Message as ${user?.name ?? 'fan'}`}
              />
              <Button type="submit">Send</Button>
            </form>
          </Card>
        </main>
      </div>
    </AuthGate>
  );
}
