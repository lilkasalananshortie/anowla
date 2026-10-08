'use client';

import React from 'react';
import { UserStats } from '@/types';

interface BadgesWidgetProps {
  stats: UserStats;
}

export default function BadgesWidget({ stats }: BadgesWidgetProps) {
  const badges = [
    {
      id: 'badge-1',
      title: 'Study Machine',
      progress: Math.min(100, Math.round((stats.cards_studied_today / stats.daily_goal) * 100)),
      subtitle: `${stats.cards_studied_today} of ${stats.daily_goal} Cards reviewed today`,
      iconBg: 'from-emerald-600/70 to-teal-700/70',
      barColor: 'bg-teal-600/70',
      shape: 'clover',
    },
    {
      id: 'badge-2',
      title: 'Double Down',
      progress: 65,
      subtitle: '2 of 3 study goals achieved this week',
      iconBg: 'from-slate-500 to-indigo-600/70',
      barColor: 'bg-slate-500',
      shape: 'diamond',
    },
    {
      id: 'badge-3',
      title: 'Streak Legend',
      progress: Math.min(100, Math.round((stats.streak / 7) * 100)),
      subtitle: `${stats.streak} of 7 days milestone streak`,
      iconBg: 'from-stone-500 to-rose-600/60',
      barColor: 'bg-rose-600/60',
      shape: 'cross',
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold tracking-wider text-white/80 uppercase">
          Badges
        </h2>
        <span className="text-xs font-medium text-white/50 hover:text-white/90 cursor-pointer transition">
          View all &gt;
        </span>
      </div>

      <div className="space-y-2.5">
        {badges.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm transition hover:scale-[1.005] hover:shadow-md border border-stone-100/80"
          >
            {/* Visual Squircle Badge Icon */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${b.iconBg} text-white shadow-sm`}
            >
              {b.shape === 'clover' && (
                <div className="grid grid-cols-2 gap-1 p-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/90" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/90" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/90" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/90" />
                </div>
              )}
              {b.shape === 'diamond' && (
                <div className="h-6 w-6 rotate-45 rounded-lg bg-white/90 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                </div>
              )}
              {b.shape === 'cross' && (
                <div className="relative flex items-center justify-center">
                  <div className="h-6 w-2 rounded-full bg-white/90" />
                  <div className="absolute h-2 w-6 rounded-full bg-white/90" />
                </div>
              )}
            </div>

            {/* Content & Progress Bar */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                {b.title}
              </h3>

              {/* Slim Progress Bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${b.barColor}`}
                  style={{ width: `${b.progress}%` }}
                />
              </div>

              <p className="mt-1.5 text-[11px] font-medium text-stone-400">
                {b.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
