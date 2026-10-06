'use client';

import React from 'react';
import { Flame, Target, Trophy, Sparkles } from 'lucide-react';
import { UserStats } from '@/types';

interface StreakWidgetProps {
  stats: UserStats;
}

export default function StreakWidget({ stats }: StreakWidgetProps) {
  const goalProgress = Math.min(100, Math.round((stats.cards_studied_today / stats.daily_goal) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Daily Streak Card */}
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <Flame className="h-6 w-6 fill-current" />
        </div>
        <div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Study Streak
          </div>
        </div>
      </div>

      {/* Daily Goal Card */}
      <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Target className="h-4 w-4 text-indigo-500" />
            <span>Daily Goal</span>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {stats.cards_studied_today} / {stats.daily_goal} cards
          </span>
        </div>
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* XP & Mastery Card */}
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {stats.xp} XP
          </div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Total Mastery Points
          </div>
        </div>
      </div>
    </div>
  );
}
