'use client';

import React from 'react';
import { Flame, Target, Trophy, TrendingUp } from 'lucide-react';
import { UserStats } from '@/types';

interface StreakWidgetProps {
  stats: UserStats;
}

export default function StreakWidget({ stats }: StreakWidgetProps) {
  const goalProgress = Math.min(100, Math.round((stats.cards_studied_today / stats.daily_goal) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      
      {/* 1. Daily Review Donut / Metric (Inspired by the Donut Screen in reference) */}
      <div className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-lg shadow-black/5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Daily Goal
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-zinc-900 tracking-tight">
              {stats.cards_studied_today}
            </span>
            <span className="text-sm font-bold text-zinc-400">
              / {stats.daily_goal} cards
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {goalProgress}% completed
          </p>
        </div>

        {/* Circular Donut Ring Graphic */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 36 36">
            <path
              className="text-zinc-100"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-lime-400 transition-all duration-700 ease-out"
              strokeDasharray={`${goalProgress}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-[11px] font-extrabold text-zinc-800">
            {goalProgress}%
          </div>
        </div>
      </div>

      {/* 2. Streak Pill Card */}
      <div className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-lg shadow-black/5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Current Streak
          </span>
          <div className="mt-1 text-3xl font-black text-zinc-900 tracking-tight flex items-baseline gap-1.5">
            <span>{stats.streak}</span>
            <span className="text-base font-bold text-zinc-500">Days</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-amber-600">
            🔥 Keep it going tomorrow
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-inner">
          <Flame className="h-8 w-8 fill-amber-500 animate-bounce" />
        </div>
      </div>

      {/* 3. Multi-Colored Pill Bar Graph (Inspired by the vertical pills in reference) */}
      <div className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-lg shadow-black/5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Weekly Activity
          </span>
          <span className="text-xs font-extrabold text-violet-600">
            {stats.xp} XP
          </span>
        </div>

        {/* 4 Vertical Pastel Pill Bars */}
        <div className="mt-3 flex items-end justify-between gap-2 h-12 px-2">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-[#d8f967] h-8 shadow-sm" />
            <span className="text-[9px] font-bold text-zinc-400">M</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-[#b6effe] h-10 shadow-sm" />
            <span className="text-[9px] font-bold text-zinc-400">T</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-[#ffc5d8] h-6 shadow-sm" />
            <span className="text-[9px] font-bold text-zinc-400">W</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-[#dccaff] h-12 shadow-sm" />
            <span className="text-[9px] font-bold text-zinc-400">T</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-full bg-zinc-200 h-4" />
            <span className="text-[9px] font-bold text-zinc-400">F</span>
          </div>
        </div>
      </div>

    </div>
  );
}
