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
      acc += typeof ev?.runs === 'number' ? ev.runs : c.text.toLowerCase().includes('six') ? 6 : c.text.toLowerCase().includes('four') ? 4 : 1;
      return { over: c.over || String(i), runs: acc };
    });
  }, [commentary]);

  const [chatInput, setChatInput] = useState('');

  async function vote(pollId: string, option: string) {
    try {
      await api.post('/api/polls/vote', { pollId, option });
      toast.success('Vote locked');
    } catch {
      toast.error('Vote failed');
    }
  }

  return (
    <AuthGate>
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-flood-400">Match center</p>
              <h1 className="text-3xl font-semibold">{detail?.name ?? 'Loading…'}</h1>
              <p className="text-sm text-slate-400">{detail?.venue}</p>
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300">
              Socket: {socketConnected ? <span className="text-flood-400">live</span> : <span className="text-amber-400">connecting</span>}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="glass-panel p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Live score</h2>
                <span className="text-xs text-slate-400">Animated deltas via websocket</span>
              </div>
              <motion.pre
                key={JSON.stringify(liveScore)}
                initial={{ opacity: 0.4, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 max-h-48 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-flood-200 scrollbar-thin"
              >
                {JSON.stringify(liveScore ?? detail?.score ?? {}, null, 2)}
              </motion.pre>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-200">Worm (cumulative narrative)</h3>
                <WormChart points={wormPoints.length ? wormPoints : [{ over: '0', runs: 0 }]} />
              </div>
            </div>

            <div className="glass-panel p-5">
              <h2 className="text-lg font-semibold">Fan reactions</h2>
              <p className="text-xs text-slate-400">Bursts sync across the room.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {REACTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => sendReaction(r)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-2xl transition hover:-translate-y-0.5 hover:border-flood-500/50"
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="relative mt-6 h-40 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-flood-500/10 to-transparent">
                <AnimatePresence>
                  {reactions.slice(0, 12).map((rx) => (
                    <motion.span
                      key={rx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute text-3xl"
                      style={{ left: `${(rx.ts % 80) + 10}%`, top: `${(rx.id.length * 7) % 60}%` }}
                    >
                      {rx.emoji}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="glass-panel p-5 lg:col-span-2">
              <h2 className="text-lg font-semibold">Commentary timeline</h2>
              <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-2 scrollbar-thin">
                {commentary.map((c) => (
                  <div key={c.id} className="rounded-xl border border-white/5 bg-black/30 p-3 text-sm">
                    <div className="text-xs text-flood-400">Over {c.over}</div>
                    <p className="text-slate-100">{c.text}</p>
                    {c.event && (
                      <p className="mt-1 text-xs text-slate-400">{JSON.stringify(c.event)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-panel p-5">
                <h2 className="text-lg font-semibold">Live polls</h2>
                <div className="mt-4 space-y-3">
                  {polls.map((p) => (
                    <div key={p._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-medium">{p.question}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {p.options.map((o) => (
                          <button
                            key={o}
                            type="button"
                            onClick={() => vote(p._id, o)}
                            className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-flood-500/50"
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!polls.length && <p className="text-sm text-slate-500">No polls yet — admins can drop one in.</p>}
                </div>
              </div>

              <div className="glass-panel p-5">
                <h2 className="text-lg font-semibold">AI insights</h2>
                <div className="mt-3 space-y-3 text-sm text-slate-300">
                  {insights?.map((i) => (
                    <div key={i.id} className="rounded-lg border border-white/5 bg-black/30 p-3">
                      <p className="text-xs uppercase text-flood-400">{i.tone}</p>
                      <p className="font-semibold text-white">{i.title}</p>
                      <p className="text-slate-400">{i.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 glass-panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Fan chat</h2>
              {typing.length > 0 && <span className="text-xs text-slate-400">{typing.join(', ')} typing…</span>}
            </div>
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto scrollbar-thin">
              {chatMessages.map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="font-semibold text-flood-300">{m.userName}</span>{' '}
                  <span className="text-slate-200">{m.text}</span>
                </div>
              ))}
            </div>
            <form
              className="mt-4 flex gap-2"
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
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-flood-500 focus:ring-2"
                placeholder={`Shout as ${user?.name ?? 'fan'}`}
              />
              <button className="rounded-full bg-flood-500 px-4 text-sm font-semibold text-pitch-950">Send</button>
            </form>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
