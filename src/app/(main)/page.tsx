'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Bell,
  Brain,
  Crown,
  Gauge,
  LineChart,
  Lock,
  MessageCircle,
  Radio,
  Rocket,
  Settings2,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Tv,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteInShell } from '@/lib/site-layout';

type FeatureLine = { title: string; desc: string };

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-reveal mb-10 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-relaxed text-ink-600 dark:text-ink-400">{subtitle}</p>
    </div>
  );
}

function FeatureGrid({ items }: { items: FeatureLine[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.title}
          className="scroll-reveal rounded-2xl border border-ink-200/80 bg-white/60 p-4 shadow-soft backdrop-blur-sm dark:border-ink-800/80 dark:bg-ink-900/40"
        >
          <p className="font-medium text-ink-900 dark:text-ink-50">{item.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{item.desc}</p>
        </li>
      ))}
    </ul>
  );
}

function IconRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-200">
      <Icon className="h-4 w-4 shrink-0 text-ink-500 dark:text-ink-400" />
      {label}
    </div>
  );
}

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
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );
    document.querySelectorAll('.scroll-reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const heroPillars = [
    { icon: Radio, label: 'Socket.IO live rooms' },
    { icon: Lock, label: 'JWT + refresh sessions' },
    { icon: Zap, label: 'TanStack Query + Redis-backed API' },
  ];

  const liveMatch: FeatureLine[] = [
    { title: 'Real-time live scores', desc: 'Score payloads pushed on the matches namespace — pick up from CricAPI in real time.' },
    { title: 'Ball-by-ball commentary', desc: 'Structured events (six, four, wicket, milestones) parsed from each delivery line.' },
    { title: 'Instant event pulses', desc: 'Pulse moments toast the room and trigger reaction bursts on big plays.' },
    { title: 'Interactive match timeline', desc: 'Key moments rail derived from the same commentary feed you see in-match.' },
    { title: 'Run worm & momentum', desc: 'Cumulative runs plus a heuristic momentum curve for narrative tension.' },
    { title: 'Win-probability lean', desc: 'A simple two-side lean from recent ball mix — honest about not being bookmaker-grade.' },
    { title: 'AI highlights feed', desc: 'Gemini digest: summary bullets, highlight lines, and hype vs analytical cards.' },
    { title: 'Multi-match tracking', desc: 'Live hub lists every current match; “For you” reorders by your favorite team.' },
  ];

  const fanEngagement: FeatureLine[] = [
    { title: 'Live emoji reactions', desc: 'One tap from the reaction rail; animations stay on-brand in monochrome.' },
    { title: 'Reaction bursts', desc: 'Socket-driven bursts stack when pulse moments fire — stadium energy on a second screen.' },
    { title: 'Match-specific fan chat', desc: 'Rooms per match with typing hints, persisted history, and message reactions.' },
    { title: 'Team fan rooms', desc: 'Join your favorite franchise namespace alongside the main match room.' },
    { title: 'Watch-party ready', desc: 'Share match links; same room works for friends on phones and laptops together.' },
    { title: 'Fan polls & predictions', desc: 'Timed questions with optional correct answers — XP when admins close and score.' },
    { title: 'Trivia & quizzes', desc: 'Fan hub serves random cricket trivia with instant verify for quick engagement loops.' },
    { title: 'MVP-style voting', desc: 'Use polls for “Player of the match” — same engine, flexible copy.' },
  ];

  const gamification: FeatureLine[] = [
    { title: 'XP points system', desc: 'Earn XP from correct poll calls; reflected on profile and leaderboards.' },
    { title: 'Daily streaks', desc: 'Streak fields on user + leaderboard documents reward consistent play.' },
    { title: 'Match badges & achievements', desc: 'Definitions unlock from XP, streaks, predictions, and follows — sync to profile.' },
    { title: 'Fan tiers', desc: 'Five tiers derived from lifetime XP so fans can flex progression.' },
    { title: 'Prediction leaderboard', desc: 'Global board with correct prediction counts alongside XP and streak.' },
    { title: 'Team loyalty', desc: 'Favorite team powers personalized ordering and team socket rooms.' },
    { title: 'Season challenges', desc: 'Achievement copy maps to season-long goals as your stats grow.' },
    { title: 'Fantasy-style contests', desc: 'Polls + XP mimic lightweight prediction leagues without a separate fantasy engine.' },
  ];

  const aiPowered: FeatureLine[] = [
    { title: 'AI match summaries', desc: 'Gemini reads live match JSON + commentary to produce a tight snapshot paragraph.' },
    { title: 'Commentary explanations', desc: '“What happened?” on any ball posts to Gemini for a plain-language recap.' },
    { title: 'Smart in-game insights', desc: 'Structured insight cards mixing hype and analytical tones from the same context.' },
    { title: 'Player comparison', desc: 'Side-by-side Gemini bullets with optional match context JSON for grounding.' },
    { title: 'Personalized recommendations', desc: 'For-you feed surfaces matches mentioning your saved favorite team first.' },
    { title: 'AI hype moments', desc: 'Insight cards explicitly carry hype tone when the model sees boundary pressure.' },
    { title: 'Smart notifications', desc: 'In-app notification documents on poll wins; header inbox with read state.' },
    { title: 'Chat safety filter', desc: 'Keyword guard on send plus user reports stored for admin review.' },
    { title: 'Sentiment heuristics', desc: 'Lightweight text scoring endpoint for moderation experiments and UI badges.' },
    { title: 'Wicket explainers', desc: 'Dedicated Gemini path for dismissal snippets in analyst voice.' },
  ];

  const personalization: FeatureLine[] = [
    { title: 'Favorite teams', desc: 'Profile field drives feed ordering and optional team room auto-join.' },
    { title: 'Favorite players', desc: 'Comma-separated list on profile for future stats tie-ins and UI badges.' },
    { title: 'Personalized match feed', desc: 'Authenticated “For you” route sorts live cards toward your franchise.' },
    { title: 'Notification preferences', desc: 'Toggle boundaries, wickets, milestones, and poll alerts for toast noise level.' },
    { title: 'Smart content hooks', desc: 'AI digest and analytics reuse the same match id — one coherent second screen.' },
    { title: 'Dark mode canvas', desc: 'System-aware theme toggle with calm ink palette across every route.' },
    { title: 'Language-ready UI', desc: 'Copy is structured in sections so localization can layer in when you add i18n.' },
    { title: 'Follow graph', desc: 'Search fans, follow up to hundreds, and unlock social achievements as you grow.' },
  ];

  const social: FeatureLine[] = [
    { title: 'Fan discovery', desc: 'User search endpoint surfaces public avatars, teams, and XP for serendipitous follows.' },
    { title: 'Share reactions & rooms', desc: 'Web Share API or clipboard on match pages so clips of banter travel fast.' },
    { title: 'Social profiles', desc: 'Profile shows tier, XP, streak, badges, and personalization fields you control.' },
    { title: 'Fan communities', desc: 'Match + team namespaces act as lightweight communities without separate forums.' },
    { title: 'Rivalry energy', desc: 'Polls and leaderboards frame head-to-head nights without toxic mechanics.' },
    { title: 'Match discussions', desc: 'Chronological chat with reactions models threaded banter for big overs.' },
    { title: 'Community polls', desc: 'Admins spawn questions everyone sees over the polls namespace in-room.' },
    { title: 'Activity signals', desc: 'Typing indicators and pulse toasts mimic presence without invasive tracking.' },
  ];

  const notifications: FeatureLine[] = [
    { title: 'Wicket & boundary pulses', desc: 'Socket pulse moments pair with profile toggles so fans choose their noise floor.' },
    { title: 'Poll result alerts', desc: 'Winners receive persisted notifications describing the question and XP grant.' },
    { title: 'Inbox in the header', desc: 'Bell drawer lists notifications; tap marks read and refreshes unread counts.' },
    { title: 'Match-start reminders', desc: 'Hook your own scheduler or marketing tool — API already exposes live lists.' },
    { title: 'Close-match alerts', desc: 'Combine pulse events with client-side rules to badge “nail-biter” sessions later.' },
    { title: 'Friend activity (foundation)', desc: 'Following ids stored — ready for activity feeds when you add events.' },
  ];

  const content: FeatureLine[] = [
    { title: 'Match previews', desc: 'Gemini preview endpoint turns match_info JSON into neutral copy blocks.' },
    { title: 'Post-match analysis', desc: 'Reuse digest + compare endpoints after final ball for recap pages.' },
    { title: 'Expert tone via prompts', desc: 'Prompts emphasize honesty when CricAPI data is thin — no invented scorelines.' },
    { title: 'Trending moments', desc: 'Timeline + highlights surface what the model and heuristics agree is loud.' },
    { title: 'Short-form highlight cards', desc: 'Digest cards are sized for second-screen skim, not long essays.' },
    { title: 'Team news hooks', desc: 'Favorite team metadata is ready for CMS or RSS injection on your roadmap.' },
  ];

  const ux: FeatureLine[] = [
    { title: 'Smooth motion', desc: 'Framer Motion on hero, cards, and match widgets keeps energy without jitter.' },
    { title: 'Dark mode first', desc: 'next-themes integration with accessible contrast on ink neutrals.' },
    { title: 'Fast-loading UI', desc: 'Route-level code splitting, optimistic sockets, and query caching by design.' },
    { title: 'Offline-friendly shell', desc: 'Persisted auth state survives refresh; sockets reconnect gracefully.' },
    { title: 'Mobile-first layouts', desc: 'Grids collapse to single column with touch-sized controls in match rooms.' },
    { title: 'Keyboard-friendly controls', desc: 'Buttons and forms use native focus rings aligned to the design system.' },
    { title: 'Multi-device sync', desc: 'JWT access + refresh means phone and laptop share the same PulsePlay identity.' },
    { title: 'Clear navigation', desc: 'Live, Fan hub, Leaderboards, Profile, and Admin paths stay one tap away.' },
  ];

  const moderation: FeatureLine[] = [
    { title: 'Spam keyword guard', desc: 'Chat pipeline rejects known spam / slur patterns before messages broadcast.' },
    { title: 'User reports', desc: 'Report endpoint logs message ids, rooms, and reporters for moderation queues.' },
    { title: 'Admin deletion', desc: 'Privileged route removes abusive chat lines when investigations finish.' },
    { title: 'Rate limiting', desc: 'API limiter middleware protects auth and public routes from brute force.' },
    { title: 'Secure authentication', desc: 'Bcrypt passwords, rotating refresh tokens, and HttpOnly-friendly patterns.' },
    { title: 'Session hygiene', desc: 'Refresh versioning invalidates stolen refresh tokens in one bump.' },
  ];

  const premium: FeatureLine[] = [
    { title: 'Ad-free posture', desc: 'No ad slots ship in the OSS layout — premium tier can hide future promos cleanly.' },
    { title: 'Advanced analytics', desc: 'Momentum + win-lean APIs are ready to gate for subscribers with a feature flag.' },
    { title: 'Exclusive rooms', desc: 'Socket namespaces can segment VIP rooms with the same infra — add auth checks.' },
    { title: 'VIP badges', desc: 'Badge array on user documents can mark subscription tiers without schema churn.' },
    { title: 'Premium predictions', desc: 'Poll limits, longer expiry windows, or private leagues map to billing later.' },
    { title: 'Deeper player intel', desc: 'Gemini compare + preview endpoints become paywalled insights with one toggle.' },
  ];

  const adminOps: FeatureLine[] = [
    { title: 'Live event moderation', desc: 'Chat reports + admin deletes close the loop on in-match incidents.' },
    { title: 'Poll management', desc: 'Admins create, close, and score polls; winners auto-notify + XP.' },
    { title: 'Analytics dashboard', desc: 'Admin route surfaces aggregate counts for polls, chat, and live matches.' },
    { title: 'User management hooks', desc: 'User search + follow data sets you up for richer admin tooling later.' },
    { title: 'Content moderation backlog', desc: 'ChatReport collection is the start of a case queue — extend with statuses.' },
    { title: 'Feature toggles', desc: 'Environment-driven keys for CricAPI and Gemini let you stage rollouts safely.' },
    { title: 'Campaign placeholders', desc: 'Notification meta fields can carry UTM payloads for growth experiments.' },
    { title: 'Operational monitoring', desc: 'Health route, structured logs on AI fallbacks, and socket error channels.' },
  ];

  const future: FeatureLine[] = [
    { title: 'AR overlays', desc: 'Export match timelines + scores to WebXR or native shells when you are ready.' },
    { title: 'Smartwatch glance', desc: 'Pulse payloads are JSON-friendly for companion widgets and complications.' },
    { title: 'Voice assistant hooks', desc: 'Gemini text endpoints can feed voice UIs with the same prompts server-side.' },
    { title: 'Regulated betting integrations', desc: 'Keep probability copy disclaimers; partner APIs can consume analytics JSON.' },
    { title: 'Collectible moments', desc: 'Mint-ready metadata: match ids, over markers, and pulse kinds for NFT drops.' },
    { title: 'Stadium mode', desc: 'Full-screen match view + haptics-ready reaction bursts for venue Wi-Fi.' },
    { title: 'AI highlight reels', desc: 'Stack Gemini summaries with FFmpeg later for auto-cut social clips.' },
    { title: 'Multi-language commentary', desc: 'Pipe CricAPI lines through translation models using the same socket fan-out.' },
    { title: 'Crowd sentiment meter', desc: 'Blend chat sentiment endpoint with reaction velocity for a live index.' },
    { title: 'TV sync', desc: 'Timestamp commentary batches to align with broadcast latency compensation logic.' },
  ];

  const highlights = [
    {
      icon: <Radio className="h-5 w-5" />,
      title: 'Live stack',
      body: 'CricAPI + Socket.IO + TanStack Query — scores, commentary, pulses, and analytics in one room.',
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: 'Fan mesh',
      body: 'Chat, reactions, polls, trivia hub, team rooms, and share flows tuned for IPL nights.',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Gemini copilots',
      body: 'Summaries, highlights, insight cards, compare, previews, wicket explainers, and sentiment helpers.',
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: 'XP & reputation',
      body: 'Poll scoring, streaks, tiers, badges, leaderboards, achievements, and follow graph foundations.',
    },
  ];

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-950 dark:text-ink-50">
      <main className="relative pt-28">
        {/* Hero */}
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

          <div className={cn('relative pb-20', siteInShell)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p className="scroll-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-500 shadow-soft backdrop-blur dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink-900 opacity-25 dark:bg-ink-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-ink-900 dark:bg-ink-50" />
                </span>
                Second-screen IPL
              </p>
              <h1 className="scroll-reveal max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                <span className="text-gradient">PulsePlay</span>
                <span className="text-ink-800 dark:text-ink-100"> — the full feature surface on one canvas.</span>
              </h1>
              <p className="scroll-reveal mt-6 max-w-2xl text-lg text-ink-600 dark:text-ink-400">
                Everything below ships in this repo today or sits on clear extension points: live data, sockets, AI, XP,
                moderation, and the calm monochrome UI you already run in production paths.
              </p>
              <div className="scroll-reveal mt-10 flex flex-wrap gap-3">
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
                <Link href="/features">
                  <Button size="lg" variant="outline">
                    Fan hub
                  </Button>
                </Link>
              </div>
            </motion.div>

            <div className="scroll-reveal mt-14 flex flex-wrap gap-4 border-t border-ink-200/60 pt-10 dark:border-ink-800/60">
              {heroPillars.map((p) => (
                <IconRow key={p.label} icon={p.icon} label={p.label} />
              ))}
            </div>

            <div className="scroll-reveal mt-10 flex flex-wrap gap-2 text-xs text-ink-500 dark:text-ink-500">
              <span className="rounded-full border border-ink-200/80 px-3 py-1 dark:border-ink-700">#live-scores</span>
              <span className="rounded-full border border-ink-200/80 px-3 py-1 dark:border-ink-700">#gemini</span>
              <span className="rounded-full border border-ink-200/80 px-3 py-1 dark:border-ink-700">#polls</span>
              <span className="rounded-full border border-ink-200/80 px-3 py-1 dark:border-ink-700">#sockets</span>
              <span className="rounded-full border border-ink-200/80 px-3 py-1 dark:border-ink-700">#moderation</span>
            </div>
          </div>
        </section>

        {/* At a glance */}
        <section className={cn('border-b border-ink-200/40 py-16 dark:border-ink-800/40', siteInShell)}>
          <SectionHeading
            eyebrow="At a glance"
            title="Four pillars, dozens of behaviors"
            subtitle="Skim the cards, then dive section by section for how each capability maps to routes, sockets, and data."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {highlights.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
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

        {/* Live match */}
        <section className={cn('py-16', siteInShell)} id="live">
          <SectionHeading
            eyebrow="Live match experience"
            title="Everything that makes a second screen feel alive"
            subtitle="Powered by CricAPI on the server, Socket.IO to clients, and client-side charts — no mock cricket data in production paths."
          />
          <FeatureGrid items={liveMatch} />
        </section>

        {/* Fan engagement */}
        <section className={cn('border-t border-ink-200/40 bg-ink-100/40 py-16 dark:border-ink-800/40 dark:bg-ink-900/25', siteInShell)} id="fans">
          <SectionHeading
            eyebrow="Fan engagement"
            title="Rooms, reactions, and lightweight games"
            subtitle="Engagement stays respectful: reactions are opt-in bursts, chat is filtered, and polls carry XP consequences admins control."
          />
          <FeatureGrid items={fanEngagement} />
        </section>

        {/* Gamification */}
        <section className={cn('py-16', siteInShell)} id="game">
          <SectionHeading
            eyebrow="Gamification"
            title="Progression without a separate fantasy product"
            subtitle="XP, streaks, badges, tiers, and boards reuse the same user documents you already persist with MongoDB."
          />
          <FeatureGrid items={gamification} />
        </section>

        {/* AI */}
        <section className={cn('border-t border-ink-200/40 py-16 dark:border-ink-800/40', siteInShell)} id="ai">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">AI-powered</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Gemini where keys are set</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-600 dark:text-ink-400">
                Google GenAI structured outputs back summaries, bullets, cards, compares, previews, and wicket explainers —
                always grounded in the JSON context you pass from CricAPI.
              </p>
            </div>
            <Brain className="h-12 w-12 text-ink-300 dark:text-ink-600" aria-hidden />
          </div>
          <FeatureGrid items={aiPowered} />
        </section>

        {/* Personalization + Social */}
        <section className={cn('grid gap-12 border-t border-ink-200/40 py-16 lg:grid-cols-2 dark:border-ink-800/40', siteInShell)}>
          <div id="personalization">
            <SectionHeading
              eyebrow="Personalization"
              title="Profiles that steer the feed"
              subtitle="Favorite teams and players, notification prefs, and follow graph foundations keep the experience yours."
            />
            <FeatureGrid items={personalization} />
          </div>
          <div id="social">
            <SectionHeading
              eyebrow="Social"
              title="Lightweight community without a separate network"
              subtitle="Search, follow, share, and discuss in the same match surfaces — heavier graph features can extend the same APIs."
            />
            <FeatureGrid items={social} />
          </div>
        </section>

        {/* Notifications + Content */}
        <section className={cn('grid gap-12 border-t border-ink-200/40 bg-ink-100/30 py-16 lg:grid-cols-2 dark:border-ink-800/40 dark:bg-ink-900/20', siteInShell)}>
          <div id="notifications">
            <SectionHeading
              eyebrow="Notification system"
              title="Toasts today, inbox tomorrow"
              subtitle="Socket pulses respect per-user toggles; persisted notifications cover poll wins with read/unread in the header."
            />
            <FeatureGrid items={notifications} />
          </div>
          <div id="content">
            <SectionHeading
              eyebrow="Content features"
              title="Editorial hooks on top of live data"
              subtitle="Preview and recap flows reuse Gemini and the analytics service so editors do not rebuild pipelines."
            />
            <FeatureGrid items={content} />
          </div>
        </section>

        {/* UX + Moderation */}
        <section className={cn('grid gap-12 border-t border-ink-200/40 py-16 lg:grid-cols-2 dark:border-ink-800/40', siteInShell)}>
          <div id="ux">
            <SectionHeading
              eyebrow="User experience"
              title="Crafted motion, resilient loading"
              subtitle="Framer Motion, next-themes, responsive grids, and TanStack Query patterns keep the UI fast and legible on phones."
            />
            <FeatureGrid items={ux} />
          </div>
          <div id="safety">
            <SectionHeading
              eyebrow="Moderation & safety"
              title="Defense in depth for public chat"
              subtitle="Keyword guardrails, user reports, admin deletes, JWT sessions, and rate limits cover the baseline for open rooms."
            />
            <FeatureGrid items={moderation} />
          </div>
        </section>

        {/* Premium + Admin */}
        <section className={cn('grid gap-12 border-t border-ink-200/40 py-16 lg:grid-cols-2 dark:border-ink-800/40', siteInShell)}>
          <div id="premium">
            <SectionHeading
              eyebrow="Premium roadmap"
              title="Monetization-ready seams"
              subtitle="Nothing here requires a payment processor yet — flags, namespaces, and badge arrays are where subscriptions attach."
            />
            <FeatureGrid items={premium} />
          </div>
          <div id="admin">
            <SectionHeading
              eyebrow="Admin & operations"
              title="Controls for the night-of team"
              subtitle="Poll lifecycle, analytics cards, chat enforcement, and env-driven feature switches align with how you already ship."
            />
            <FeatureGrid items={adminOps} />
          </div>
        </section>

        {/* Future */}
        <section className={cn('border-t border-ink-200/40 py-16 dark:border-ink-800/40', siteInShell)} id="future">
          <SectionHeading
            eyebrow="Future-level"
            title="Where PulsePlay can grow next"
            subtitle="These items are not hard dependencies — they describe natural extensions of the same events, analytics JSON, and AI prompts you already emit."
          />
          <FeatureGrid items={future} />
        </section>

        {/* Wayfinding */}
        <section className={cn('border-t border-ink-200/40 py-14 dark:border-ink-800/40', siteInShell)}>
          <div className="scroll-reveal rounded-3xl border border-ink-200/80 bg-white/70 p-8 dark:border-ink-800/80 dark:bg-ink-900/50">
            <h2 className="text-2xl font-semibold tracking-tight">Jump into the product</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-600 dark:text-ink-400">
              Each route below exercises a different slice of the feature matrix — sign in to unlock personalized feeds,
              notifications, and AI.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/matches">
                <Button variant="outline" className="gap-2">
                  <Tv className="h-4 w-4" />
                  Live matches
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" className="gap-2">
                  <Target className="h-4 w-4" />
                  Fan hub
                </Button>
              </Link>
              <Link href="/leaderboards">
                <Button variant="outline" className="gap-2">
                  <LineChart className="h-4 w-4" />
                  Leaderboards
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-ink-200/60 bg-ink-900 py-20 text-ink-50 dark:border-ink-800/60 dark:bg-ink-100 dark:text-ink-950">
          <div className={cn('text-center', siteInShell)}>
            <h2 className="scroll-reveal text-3xl font-semibold tracking-tight">Ready when the toss lands</h2>
            <p className="scroll-reveal mx-auto mt-4 max-w-2xl text-sm text-ink-300 dark:text-ink-600">
              Sign in, pick a match room, and feel the full stack: pulses, digest, analytics, chat, polls, and XP — all on
              the monochrome canvas.
            </p>
            <div className="scroll-reveal mt-8 flex flex-wrap justify-center gap-4">
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
            <div className="scroll-reveal mt-10 flex flex-wrap justify-center gap-6 text-xs text-ink-400 dark:text-ink-600">
              <span className="inline-flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" /> Live analytics
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5" /> Notifications
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Moderation
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5" /> Premium-ready
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5" /> Admin ops
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Rocket className="h-3.5 w-3.5" /> Roadmap
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
