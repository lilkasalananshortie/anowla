'use client';

import React from 'react';
import { UserStats } from '@/types';
import { Award, ShieldCheck, Zap, CheckCircle2, BookOpen } from 'lucide-react';

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
      title: 'Daily Study Quota',
      progress: goalProgress,
      subtitle: `${stats.cards_studied_today} of ${stats.daily_goal || 20} cards reviewed today`,
      iconBg: 'bg-[#22396f] text-[#fcf1d0]',
      barColor: 'bg-[#fcf1d0]',
      icon: BookOpen,
      isCompleted: goalProgress >= 100,
    },
    {
      id: 'badge-2',
      title: '7-Day Retention Streak',
      progress: streakProgress,
      subtitle: `${stats.streak} of 7 days milestone streak`,
      iconBg: 'bg-[#010736] text-[#fcf1d0] border border-[#22396f]',
      barColor: 'bg-[#fcf1d0]',
      icon: Zap,
      isCompleted: streakProgress >= 100,
    },
    {
      id: 'badge-3',
      title: 'Scholar Rank (1,000 XP)',
      progress: xpProgress,
      subtitle: `${stats.xp} of 1,000 XP towards Level 2`,
      iconBg: 'bg-[#22396f] text-[#fcf1d0]',
      barColor: 'bg-[#fcf1d0]',
      icon: Award,
      isCompleted: xpProgress >= 100,
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#fcf1d0]" />
          <h2 className="text-xs font-bold tracking-wider text-[#fcf1d0]/80 uppercase">
            Mastery Milestones
          </h2>
        </div>
        <span className="text-xs font-semibold text-[#fcf1d0]/60 hover:text-[#fcf1d0] cursor-pointer transition">
          View all milestones &gt;
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              className="group relative flex items-center gap-4 rounded-2xl bg-[#0d1c42] p-4 shadow-lg transition-all hover:border-[#fcf1d0]/40 border border-[#22396f]"
            >
              {/* Squircle Badge Icon */}
              <div
                className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${b.iconBg} shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Icon className="h-6 w-6" />
                {b.isCompleted && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#fcf1d0] text-[#010736] ring-2 ring-[#0d1c42]">
                    <CheckCircle2 size={10} />
                  </span>
                )}
              </div>

              {/* Content & Progress Bar */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-bold text-[#fcf1d0] tracking-tight truncate">
                    {b.title}
                  </h3>
                  <span className="text-[10px] font-extrabold text-[#fcf1d0]/60">
                    {b.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#010736] border border-[#22396f]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${b.barColor}`}
                    style={{ width: `${b.progress}%` }}
                  />
                </div>

                <p className="mt-1.5 text-[10px] font-semibold text-[#fcf1d0]/60 truncate">
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
