'use client';

import React from 'react';
import { UserStats } from '@/types';
import { Award, ShieldCheck, HeartPulse, Zap, CheckCircle2 } from 'lucide-react';

interface BadgesWidgetProps {
  stats: UserStats;
}

export default function BadgesWidget({ stats }: BadgesWidgetProps) {
  const goalProgress = Math.min(100, Math.round((stats.cards_studied_today / (stats.daily_goal || 20)) * 100));
  const streakProgress = Math.min(100, Math.round((stats.streak / 7) * 100));
  const xpProgress = Math.min(100, Math.round((stats.xp / 1000) * 100));

  const badges = [
    {
      id: 'badge-1',
      title: 'Daily Clinical Quota',
      progress: goalProgress,
      subtitle: `${stats.cards_studied_today} of ${stats.daily_goal || 20} cards reviewed today`,
      iconBg: 'bg-[#84a282] text-white',
      barColor: 'bg-[#84a282]',
      icon: HeartPulse,
      isCompleted: goalProgress >= 100,
    },
    {
      id: 'badge-2',
      title: '7-Day Retention Streak',
      progress: streakProgress,
      subtitle: `${stats.streak} of 7 days milestone streak`,
      iconBg: 'bg-amber-500 text-white',
      barColor: 'bg-amber-500',
      icon: Zap,
      isCompleted: streakProgress >= 100,
    },
    {
      id: 'badge-3',
      title: 'NCLEX Scholar Rank (1,000 XP)',
      progress: xpProgress,
      subtitle: `${stats.xp} of 1,000 XP towards Level 2`,
      iconBg: 'bg-[#703348] text-[#f6e2e9]',
      barColor: 'bg-[#703348]',
      icon: Award,
      isCompleted: xpProgress >= 100,
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#84a282]" />
          <h2 className="text-xs font-bold tracking-wider text-[#19251a] uppercase">
            Clinical Mastery Milestones
          </h2>
        </div>
        <span className="text-xs font-semibold text-[#84a282] hover:text-[#6e8c6c] cursor-pointer transition">
          View all badges &gt;
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              className="group relative flex items-center gap-4 rounded-3xl bg-white p-4 shadow-xs transition-all hover:scale-[1.01] hover:shadow-md border border-[#dfe8dc] hover:border-[#84a282]"
            >
              {/* Squircle Badge Icon */}
              <div
                className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${b.iconBg} shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Icon className="h-6 w-6" />
                {b.isCompleted && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                    <CheckCircle2 size={10} />
                  </span>
                )}
              </div>

              {/* Content & Progress Bar */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-bold text-[#19251a] tracking-tight truncate">
                    {b.title}
                  </h3>
                  <span className="text-[10px] font-extrabold text-[#586c5a]">
                    {b.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#fefaf3] border border-[#dfe8dc]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${b.barColor}`}
                    style={{ width: `${b.progress}%` }}
                  />
                </div>

                <p className="mt-1.5 text-[10px] font-semibold text-[#586c5a] truncate">
                  {b.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
