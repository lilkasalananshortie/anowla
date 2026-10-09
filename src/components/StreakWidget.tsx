'use client';

import React from 'react';
import { Flame, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { UserStats } from '@/types';

interface StreakWidgetProps {
  stats: UserStats;
}

export default function StreakWidget({ stats }: StreakWidgetProps) {
  const goalProgress = Math.min(100, Math.round((stats.cards_studied_today / (stats.daily_goal || 20)) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* 1. Daily Review Donut / Metric */}
      <div className="flex items-center justify-between rounded-2xl bg-[#0d1c42] p-5 border border-[#22396f] transition hover:border-[#fcf1d0]/40 shadow-lg">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#fcf1d0]/60">
            Daily Review Quota
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#fcf1d0] tracking-tight">
              {stats.cards_studied_today}
            </span>
            <span className="text-sm font-semibold text-[#fcf1d0]/50">
              / {stats.daily_goal || 20} cards
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#fcf1d0] flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{goalProgress}% completed today</span>
          </p>
        </div>

        {/* Circular Donut Ring Graphic with Color Hunt Palette */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 36 36">
            <path
              className="text-[#22396f]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#fcf1d0] transition-all duration-700 ease-out"
              strokeDasharray={`${goalProgress}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-[11px] font-extrabold text-[#fcf1d0]">
            {goalProgress}%
          </div>
        </div>
      </div>

      {/* 2. Streak Card with Animated Fire */}
      <div className="flex items-center justify-between rounded-2xl bg-[#0d1c42] p-5 border border-[#22396f] transition hover:border-[#fcf1d0]/40 shadow-lg">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#fcf1d0]/60">
            Study Streak
          </span>
          <div className="mt-1 text-3xl font-extrabold text-[#fcf1d0] tracking-tight flex items-baseline gap-1.5">
            <span>{stats.streak}</span>
            <span className="text-sm font-semibold text-[#fcf1d0]/50">Days</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#fcf1d0]/80 flex items-center gap-1">
            <Zap className="h-3 w-3 fill-[#fcf1d0] text-[#fcf1d0]" />
            <span>Spaced Repetition Active</span>
          </p>
        </div>

        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#010736] border border-[#22396f] shadow-sm">
          <Flame className="h-7 w-7 text-[#fcf1d0] fill-[#fcf1d0]" />
        </div>
      </div>

      {/* 3. Weekly Activity Bars */}
      <div className="flex flex-col justify-between rounded-2xl bg-[#0d1c42] p-5 border border-[#22396f] transition hover:border-[#fcf1d0]/40 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#fcf1d0]/60">
            Weekly Activity
          </span>
          <span className="text-xs font-extrabold text-[#fcf1d0] flex items-center gap-1">
            <Sparkles size={12} />
            <span>{stats.xp} XP</span>
          </span>
        </div>

        {/* 7 Vertical Pill Bars with hover interaction */}
        <div className="mt-3 flex items-end justify-between gap-2.5 h-12 px-1">
          {[
            { day: 'M', height: 'h-8', bg: 'bg-[#22396f]' },
            { day: 'T', height: 'h-11', bg: 'bg-[#fcf1d0]' },
            { day: 'W', height: 'h-6', bg: 'bg-[#22396f]' },
            { day: 'T', height: 'h-12', bg: 'bg-[#fcf1d0]' },
            { day: 'F', height: 'h-9', bg: 'bg-[#22396f]' },
            { day: 'S', height: 'h-7', bg: 'bg-[#22396f]' },
            { day: 'S', height: 'h-5', bg: 'bg-[#22396f]/60' },
          ].map((bar, idx) => (
            <div key={idx} className="group/bar flex flex-col items-center gap-1 flex-1 cursor-pointer">
              <div 
                className={`w-full rounded-full ${bar.bg} ${bar.height} transition-all duration-300 group-hover/bar:scale-y-110 shadow-xs`} 
              />
              <span className="text-[9px] font-bold text-[#fcf1d0]/50 group-hover/bar:text-[#fcf1d0]">
                {bar.day}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
