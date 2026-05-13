'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Sparkles, Radio, MessageCircle, Trophy, Brain } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-flood-400">
            <Radio className="h-3.5 w-3.5" /> Second-screen IPL
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            <span className="text-gradient">PulsePlay</span> — feel every ball with fans worldwide.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Live scores, ball-by-ball energy, predictions, AI insights, and chat — tuned for the IPL night under lights.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/matches"
              className="rounded-full bg-gradient-to-r from-flood-500 to-teal-600 px-8 py-3 text-sm font-semibold text-pitch-950 shadow-glow"
            >
              Enter the arena
            </Link>
            <Link href="/register" className="rounded-full border border-white/20 px-8 py-3 text-sm text-slate-100">
              Create account
            </Link>
          </div>
        </motion.div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { icon: <Sparkles className="h-5 w-5" />, title: 'Live pulse', body: 'Sockets drive score, reactions, and hype overlays in real time.' },
            { icon: <MessageCircle className="h-5 w-5" />, title: 'Fan rooms', body: 'Match and team rooms with typing hints and emoji bursts.' },
            { icon: <Brain className="h-5 w-5" />, title: 'AI layer', body: 'Momentum reads and explainers — ready to wire to your model.' },
            { icon: <Trophy className="h-5 w-5" />, title: 'XP & ladders', body: 'Predictions award XP; leaderboards celebrate streaks.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6"
            >
              <div className="mb-3 text-flood-400">{f.icon}</div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
