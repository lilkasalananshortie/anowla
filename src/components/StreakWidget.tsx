'use client';

import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { UserStats } from '@/types';

interface StreakWidgetProps {
  stats: UserStats;
}

export default function StreakWidget({ stats }: StreakWidgetProps) {
  const goalProgress = Math.min(100, Math.round((stats.cards_studied_today / stats.daily_goal) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      
      {/* 1. Daily Review Donut / Metric */}
      <div className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm border border-stone-100">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Daily Goal
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-stone-900 tracking-tight">
              {stats.cards_studied_today}
            </span>
            <span className="text-sm font-medium text-stone-400">
              / {stats.daily_goal} cards
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-teal-700 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {goalProgress}% completed
          </p>
        </div>

        {/* Circular Donut Ring Graphic with soft, calm colors */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 36 36">
            <path
              className="text-stone-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-teal-600 transition-all duration-700 ease-out"
              strokeDasharray={`${goalProgress}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-[11px] font-bold text-stone-700">
            {goalProgress}%
          </div>
        </div>
      </div>

      {/* 2. Streak Card with gentle warmth */}
      <div className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm border border-stone-100">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Current Streak
          </span>
          <div className="mt-1 text-3xl font-bold text-stone-900 tracking-tight flex items-baseline gap-1.5">
            <span>{stats.streak}</span>
            <span className="text-sm font-medium text-stone-400">Days</span>
          </div>
          <p className="mt-1 text-xs font-medium text-amber-700">
            Consistent daily progress
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50/80 text-amber-600">
          <Flame className="h-6 w-6 fill-amber-500" />
        </div>
      </div>

      {/* 3. Multi-Colored Pill Bar Graph (Muted tones) */}
      <div className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Weekly Activity
          </span>
          <span className="text-xs font-bold text-stone-700">
            {stats.xp} XP
          </span>
        </div>

        {/* 5 Vertical Muted Pill Bars */}
        <div className="mt-3 flex items-end justify-between gap-2 h-12 px-2">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-[#c9dcce] h-8" />
            <span className="text-[9px] font-semibold text-stone-400">M</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-[#c8d8e6] h-10" />
            <span className="text-[9px] font-semibold text-stone-400">T</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-[#e3d7cf] h-6" />
            <span className="text-[9px] font-semibold text-stone-400">W</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-[#d6cedc] h-12" />
            <span className="text-[9px] font-semibold text-stone-400">T</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-stone-200 h-4" />
            <span className="text-[9px] font-semibold text-stone-400">F</span>
          </div>
        </div>
      </div>

    </div>
  );
}
