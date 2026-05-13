'use client';

import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { config } from '@/config';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSocketStatus } from '@/store/socket/socketSlice';
import { setLiveScore, appendCommentary } from '@/store/matches/matchesSlice';
import { pushReaction } from '@/store/reactions/reactionsSlice';
import { appendMessage, setTyping } from '@/store/chat/chatSlice';
import { upsertPoll } from '@/store/polls/pollsSlice';
import { setLeaderboard } from '@/store/leaderboard/leaderboardSlice';
import api from '@/lib/api';

export function usePulseSockets(matchId: string | undefined) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const userName = useAppSelector((s) => s.auth.user?.name);
  const matchesRef = useRef<Socket | null>(null);
  const chatRef = useRef<Socket | null>(null);
  const pollsRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const opts = { auth: { token: accessToken }, transports: ['websocket', 'polling'] as const };
    const base = config.wsUrl;

    const m = io(`${base}/matches`, opts);
    matchesRef.current = m;
    m.on('connect', () => dispatch(setSocketStatus({ connected: true })));
    m.on('disconnect', () => dispatch(setSocketStatus({ connected: false })));
    m.emit('join_match', { matchId });
    m.on('live_score_update', (payload: { matchId: string } & Record<string, unknown>) => {
      dispatch(setLiveScore({ matchId: payload.matchId, payload }));
    });
    m.on(
      'new_commentary',
      (payload: { matchId: string; text: string; over: string; structured?: unknown; id?: string }) => {
        if (payload.matchId !== matchId) return;
        dispatch(
          appendCommentary({
            id: payload.id ?? `${Date.now()}`,
            over: payload.over,
            ball: '',
            text: payload.text,
            event: payload.structured,
          })
        );
      }
    );
    m.on('fan_reaction', (payload: { matchId: string; emoji: string; ts: number }) => {
      if (payload.matchId === matchId) dispatch(pushReaction(payload));
    });
    m.on('leaderboard_update', async () => {
      try {
        const { data } = await api.get('/api/leaderboard');
        if (data?.success) dispatch(setLeaderboard(data.data));
      } catch {
        /* ignore */
      }
    });

    const c = io(`${base}/chat`, opts);
    chatRef.current = c;
    const room = `match:${matchId}`;
    c.emit('join_room', { matchId, room });
    c.on('chat_message', (msg: { id: string; userName: string; text: string; createdAt?: string }) => {
      dispatch(
        appendMessage({
          room,
          message: { id: msg.id, userName: msg.userName, text: msg.text, createdAt: msg.createdAt },
        })
      );
    });
    c.on('typing', (payload: { userName?: string }) => {
      dispatch(setTyping({ room, users: payload.userName ? [payload.userName] : [] }));
    });

    const p = io(`${base}/polls`, opts);
    pollsRef.current = p;
    p.emit('join_match_polls', { matchId });
    p.on('poll_created', (poll: { pollId: string; question: string; options: string[]; matchId: string; expiresAt: string }) => {
      dispatch(
        upsertPoll({
          _id: poll.pollId,
          question: poll.question,
          options: poll.options,
          matchId: poll.matchId,
          expiresAt: poll.expiresAt,
          status: 'open',
        })
      );
    });

    return () => {
      m.emit('leave_match', { matchId });
      m.disconnect();
      c.disconnect();
      p.disconnect();
      matchesRef.current = null;
      chatRef.current = null;
      pollsRef.current = null;
    };
  }, [accessToken, dispatch, matchId]);

  const sendReaction = useCallback(
    (emoji: string) => {
      if (!matchId) return;
      matchesRef.current?.emit('fan_reaction', { matchId, emoji });
    },
    [matchId]
  );

  const sendChat = useCallback(
    (text: string) => {
      if (!matchId) return;
      const room = `match:${matchId}`;
      chatRef.current?.emit('send_message', {
        matchId,
        room,
        text,
        userName: userName || 'Fan',
      });
    },
    [matchId, userName]
  );

  const sendTyping = useCallback(() => {
    if (!matchId) return;
    const room = `match:${matchId}`;
    chatRef.current?.emit('typing', { room, userName: userName || 'Fan' });
  }, [matchId, userName]);

  return { sendReaction, sendChat, sendTyping };
}
