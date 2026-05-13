'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthGate } from '@/components/AuthGate';
import { PageContainer } from '@/components/layout/PageContainer';
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
import { isAxiosError } from 'axios';
import { WormChart } from '@/components/match/WormChart';
import { MomentumChart } from '@/components/match/MomentumChart';
import { MatchTimeline } from '@/components/match/MatchTimeline';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Share2, Sparkles } from 'lucide-react';

const REACTIONS = ['🔥', '😱', '👏', '💔', '🐐'];

type MatchAiPack = {
  summary: string;
  highlights: string[];
  insights: { id: string; title: string; body: string; tone: string; createdAt?: string }[];
};

function axiosMessage(err: unknown): string {
  if (isAxiosError(err) && err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
    return String((err.response.data as { message?: string }).message);
  }
  return isAxiosError(err) ? err.message : 'Something went wrong';
}

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

  const { sendReaction, sendChat, sendTyping } = usePulseSockets(matchId, user?.favoriteTeam);

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

  const { data: aiPack, isError: aiError, error: aiQueryError } = useQuery({
    queryKey: ['ai', matchId],
    enabled: !!matchId,
    retry: false,
    queryFn: async () => {
      const res = await api.get<{ data: MatchAiPack }>(`/api/ai/match/${matchId}`);
      return res.data.data;
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

  const { data: analytics } = useQuery({
    queryKey: ['analytics', matchId],
    enabled: !!matchId,
    refetchInterval: 60_000,
    queryFn: async () => {
      const res = await api.get<{
        data: {
          momentum: { over: string; score: number }[];
          winProbability: { teamA: string; teamB: string; pTeamA: number; pTeamB: number; note: string };
          timeline: { id: string; over: string; label: string; kind: string }[];
        };
      }>(`/api/matches/${matchId}/analytics`);
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
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const [compareLines, setCompareLines] = useState<string[] | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  async function vote(pollId: string, option: string) {
    try {
      await api.post('/api/polls/vote', { pollId, option });
      toast.success('Vote recorded');
    } catch {
      toast.error('Vote failed');
    }
  }

  async function shareMatch() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: detail?.name ?? 'PulsePlay', text: 'Join me on PulsePlay', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Match link copied');
      }
    } catch {
      toast.error('Could not share');
    }
  }

  async function runCompare() {
    if (!compareA.trim() || !compareB.trim()) return;
    setCompareLoading(true);
    try {
      const ctx = JSON.stringify({ match: detail, recent: commentary.slice(-12).map((c) => c.text) });
      const res = await api.post<{ data: { comparison: string[] } }>('/api/ai/compare-players', {
        playerA: compareA.trim(),
        playerB: compareB.trim(),
        context: ctx,
      });
      setCompareLines(res.data.data.comparison ?? []);
    } catch (e) {
      toast.error(axiosMessage(e));
    } finally {
      setCompareLoading(false);
    }
  }

  async function explainBall(text: string) {
    try {
      const res = await api.post<{ data: { explanation: string } }>('/api/ai/what-happened', { text });
      toast.message('What happened?', { description: res.data.data.explanation, duration: 12_000 });
    } catch (e) {
      toast.error(axiosMessage(e));
    }
  }

  async function reportChatMessage(messageId: string) {
    try {
      await api.post('/api/chat/report', { messageId, matchId, room });
      toast.success('Thanks — report logged for review.');
    } catch {
      toast.error('Report failed');
    }
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
        <PageContainer>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">Match room</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                {detail?.name ?? 'Loading…'}
              </h1>
              {detail?.venue && <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">{detail.venue}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-ink-200 bg-white/80 px-4 py-2 text-xs font-medium text-ink-600 shadow-soft dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-300">
                Socket:{' '}
                {socketConnected ? (
                  <span className="text-ink-900 dark:text-ink-50">live</span>
                ) : (
                  <span className="text-ink-500">connecting</span>
                )}
              </div>
              {user?.favoriteTeam ? (
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-100">
                  Team room: {user.favoriteTeam}
                </span>
              ) : null}
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => void shareMatch()}>
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
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
                <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-200">Run worm</h3>
                <WormChart points={wormPoints.length ? wormPoints : [{ over: '0', runs: 0 }]} />
              </div>
            </Card>

            <Card>
              <CardTitle>Live analytics</CardTitle>
              <CardDescription>Heuristic momentum, key-event timeline, and rough win lean from recent balls.</CardDescription>
              <div className="mt-4 space-y-4">
                {analytics?.winProbability ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Win lean</p>
                    <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
                      <div
                        className="bg-ink-900 dark:bg-ink-100"
                        style={{ width: `${Math.round(analytics.winProbability.pTeamA * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-ink-600 dark:text-ink-400">
                      {analytics.winProbability.teamA}: {(analytics.winProbability.pTeamA * 100).toFixed(0)}% ·{' '}
                      {analytics.winProbability.teamB}: {(analytics.winProbability.pTeamB * 100).toFixed(0)}%
                    </p>
                    <p className="mt-1 text-xs text-ink-500 dark:text-ink-500">{analytics.winProbability.note}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Momentum</p>
                  <MomentumChart points={analytics?.momentum?.length ? analytics.momentum : [{ over: '0', score: 0 }]} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Key moments</p>
                  <div className="mt-2 max-h-48 overflow-y-auto pr-1">
                    <MatchTimeline items={analytics?.timeline ?? []} />
                  </div>
                </div>
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
                    className="rounded-2xl border border-ink-200 bg-white px-4 py-2 text-2xl transition hover:-translate-y-0.5 hover:border-ink-400 hover:shadow-soft active:scale-95 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-ink-500"
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
                {commentary.length === 0 ? (
                  <p className="text-sm text-ink-500 dark:text-ink-400">No ball-by-ball lines yet for this match (or CricAPI has no feed).</p>
                ) : null}
                {commentary.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-ink-200/80 bg-white/60 p-3 text-sm dark:border-ink-800/80 dark:bg-ink-900/40"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
                      Over {c.over}
                    </div>
                    <p className="mt-1 text-ink-900 dark:text-ink-100">{c.text}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => void explainBall(c.text)}>
                        What happened?
                      </Button>
                    </div>
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
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Player compare
                </CardTitle>
                <CardDescription>Gemini — grounded in this match feed when you run compare.</CardDescription>
                <div className="mt-3 space-y-2">
                  <input
                    value={compareA}
                    onChange={(e) => setCompareA(e.target.value)}
                    placeholder="Player A"
                    className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50"
                  />
                  <input
                    value={compareB}
                    onChange={(e) => setCompareB(e.target.value)}
                    placeholder="Player B"
                    className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50"
                  />
                  <Button type="button" size="sm" disabled={compareLoading} onClick={() => void runCompare()}>
                    {compareLoading ? 'Comparing…' : 'Compare with AI'}
                  </Button>
                  {compareLines?.length ? (
                    <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-ink-700 dark:text-ink-300">
                      {compareLines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Card>

              <Card>
                <CardTitle>Gemini match digest</CardTitle>
                <CardDescription>Summaries and highlights from your live CricAPI feed (same Gemini stack as HackAIBengaluru).</CardDescription>
                {aiError ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/90 p-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                    {axiosMessage(aiQueryError)}
                  </p>
                ) : null}
                {!aiError && aiPack ? (
                  <div className="mt-3 space-y-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Summary</p>
                      <p className="mt-1 text-ink-800 dark:text-ink-200">{aiPack.summary}</p>
                    </div>
                    {aiPack.highlights?.length ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Highlights</p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-ink-700 dark:text-ink-300">
                          {aiPack.highlights.map((h, idx) => (
                            <li key={`${idx}-${h.slice(0, 24)}`}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {aiPack.insights?.length ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Insight cards</p>
                        {aiPack.insights.map((i) => (
                          <div
                            key={i.id}
                            className="rounded-lg border border-ink-200 bg-white/70 p-3 dark:border-ink-800 dark:bg-ink-900/50"
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{i.tone}</p>
                            <p className="font-semibold text-ink-900 dark:text-ink-50">{i.title}</p>
                            <p className="text-ink-600 dark:text-ink-400">{i.body}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {!aiError && !aiPack ? <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">Loading AI digest…</p> : null}
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
                <div key={m.id} className="group flex flex-wrap items-start justify-between gap-2 text-sm">
                  <div>
                    <span className="font-semibold text-ink-900 dark:text-ink-100">{m.userName}</span>{' '}
                    <span className="text-ink-700 dark:text-ink-300">{m.text}</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 shrink-0 text-xs opacity-0 transition group-hover:opacity-100"
                    onClick={() => void reportChatMessage(m.id)}
                  >
                    Report
                  </Button>
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
                className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none ring-ink-900/10 focus:ring-2 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50"
                placeholder={`Message as ${user?.name ?? 'fan'}`}
              />
              <Button type="submit">Send</Button>
            </form>
          </Card>
        </PageContainer>
      </div>
    </AuthGate>
  );
}
