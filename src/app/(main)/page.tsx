'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Radio, Sparkles, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteInShell } from '@/lib/site-layout';

export default function LandingPage() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in-view');
          else e.target.classList.remove('in-view');
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.scroll-reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const features = [
    { icon: <Radio className="h-5 w-5" />, title: 'Live wire', body: 'Scores, commentary, and rooms synced over Socket.IO.' },
    { icon: <MessageCircle className="h-5 w-5" />, title: 'Fan mesh', body: 'Match rooms, typing hints, emoji reactions — monochrome UI.' },
    { icon: <Sparkles className="h-5 w-5" />, title: 'AI layer', body: 'Gemini summaries, highlights, and insight cards from live CricAPI data.' },
    { icon: <Trophy className="h-5 w-5" />, title: 'XP ladder', body: 'Polls, streaks, and leaderboards tuned for rivalry nights.' },
  ];

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-950 dark:text-ink-50">
      <main className="relative pt-28">
        <section className="relative overflow-hidden border-b border-ink-200/60 dark:border-ink-800/60">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]">
              <div className="absolute inset-0 pattern-dots text-ink-300 dark:text-ink-700" />
            </div>
            <div
              className="absolute h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-ink-200/40 to-transparent blur-3xl dark:from-ink-800/25"
              style={{ left: mouse.x, top: mouse.y * 0.4 }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ink-50 to-transparent dark:from-ink-950 dark:to-transparent" />
          </div>

          <div className={cn('relative pb-24', siteInShell)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p className="scroll-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-500 shadow-soft backdrop-blur dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink-900 opacity-25 dark:bg-ink-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-ink-900 dark:bg-ink-50" />
                </span>
                Second screen IPL
              </p>
              <h1 className="scroll-reveal max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                <span className="text-gradient">PulsePlay</span>
                <span className="text-ink-800 dark:text-ink-100"> — every ball, every fan, one surface.</span>
              </h1>
              <p className="scroll-reveal mt-6 max-w-2xl text-lg text-ink-600 dark:text-ink-400">
                A calm black-and-white canvas that flares to life with motion, sockets, and crisp Inter typography — inspired by
                modern product craft.
              </p>
              <div className="scroll-reveal mt-10 flex flex-wrap gap-4">
                <Link href="/matches">
                  <Button size="lg" className="group gap-2">
                    Enter live hub
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">
                    Create account
                  </Button>
                </Link>
              </div>
            </motion.div>

            <div className="scroll-reveal mt-16 grid gap-3 sm:grid-cols-3">
              {[
                { v: 'Live', d: 'Socket rooms + pulses' },
                { v: 'Fair', d: 'JWT + refresh flow' },
                { v: 'Fast', d: 'TanStack Query cache' },
              ].map((s) => (
                <div
                  key={s.v}
                  className="glass-panel-interactive flex flex-col justify-between border-ink-200/80 p-5 dark:border-ink-800/80"
                >
                  <Zap className="h-5 w-5 text-ink-400" />
                  <div className="mt-4 text-2xl font-semibold">{s.v}</div>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn('py-20', siteInShell)}>
          <div className="scroll-reveal mb-12 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Built for noisy stadium nights</h2>
            <p className="mt-3 text-ink-600 dark:text-ink-400">Hover cards lift subtly; motion stays purposeful, not loud.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="glass-panel-interactive scroll-reveal p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="border-t border-ink-200/60 bg-ink-900 py-20 text-ink-50 dark:border-ink-800/60 dark:bg-ink-100 dark:text-ink-950">
          <div className={cn('py-20 text-center', siteInShell)}>
            <h2 className="scroll-reveal text-3xl font-semibold tracking-tight">Ready when the toss lands</h2>
            <p className="scroll-reveal mx-auto mt-4 max-w-xl text-sm text-ink-300 dark:text-ink-600">
              Sign in, pick a match, and let the monochrome canvas carry the energy.
            </p>
            <div className="scroll-reveal mt-8 flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="dark:bg-ink-900 dark:text-ink-50 dark:hover:bg-ink-800">
                  Sign in
                </Button>
              </Link>
              <Link href="/matches">
                <Button size="lg" variant="outline" className="border-ink-600 text-ink-50 hover:bg-ink-800 dark:border-ink-400 dark:text-ink-950 dark:hover:bg-ink-200">
                  Browse matches
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
