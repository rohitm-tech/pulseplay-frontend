'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function WormChart({ points }: { points: { over: string; runs: number }[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <XAxis dataKey="over" stroke="#94a3b8" fontSize={10} />
          <YAxis stroke="#94a3b8" fontSize={10} />
          <Tooltip
            contentStyle={{ background: '#04140c', border: '1px solid rgba(255,255,255,0.1)' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line type="monotone" dataKey="runs" stroke="#2dd4bf" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
