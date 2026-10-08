'use client';

import React from 'react';
import { Deck, UserStats, Card } from '@/types';
import { 
  X, 
  Trophy, 
  Brain, 
  Calendar, 
  Flame, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Zap,
  BarChart3
} from 'lucide-react';

interface MasteryAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: Deck[];
  stats: UserStats;
}

export default function MasteryAnalyticsModal({
  isOpen,
  onClose,
  decks,
  stats,
}: MasteryAnalyticsModalProps) {
  if (!isOpen) return null;

  // Flatten all cards across all decks
  const allCards: Card[] = decks.flatMap((d) => d.cards || []);

  // 1. Spaced Repetition Maturity Buckets
  const matureCards = allCards.filter((c) => (c.interval || 0) >= 21).length;
  const learningCards = allCards.filter((c) => (c.interval || 0) > 0 && (c.interval || 0) < 21).length;
  const newCards = allCards.filter((c) => !c.repetitions || c.repetitions === 0).length;

  const totalCards = allCards.length || 1; // avoid divide by zero
  const maturePercent = Math.round((matureCards / totalCards) * 100);
  const learningPercent = Math.round((learningCards / totalCards) * 100);
  const newPercent = Math.round((newCards / totalCards) * 100);

  // 2. 7-Day Forecast Calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const forecastDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });

    // Count cards due on or before this day (for today) or specifically on this day
    const dueCount = allCards.filter((c) => {
      const cardDue = new Date(c.due_date);
      cardDue.setHours(0, 0, 0, 0);
      if (i === 0) {
        return cardDue <= d;
      }
      return cardDue.getTime() === d.getTime();
    }).length;

    return {
      day: dayName,
      date: d.getDate(),
      count: dueCount,
    };
  });

  const maxForecast = Math.max(...forecastDays.map((f) => f.count), 5);

  // 3. Level & XP progress
  const currentLevel = Math.floor(stats.xp / 200) + 1;
  const xpIntoCurrentLevel = stats.xp % 200;
  const levelProgressPercent = Math.round((xpIntoCurrentLevel / 200) * 100);

  // 4. Categories breakdown
  const categoryCounts: Record<string, number> = {};
  decks.forEach((d) => {
    const cat = d.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + (d.cards?.length || d.cards_count || 0);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#18202d] border border-white/10 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1c2534]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Review & Retention Analytics
              </h3>
              <p className="text-xs text-white/60">
                Card maturity buckets and 7-day review forecast
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Level & Streak Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#222c3d] p-4 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Student Level</span>
                <Award className="h-4 w-4 text-amber-300" />
              </div>
              <div className="text-xl font-bold text-white">Level {currentLevel}</div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-amber-400 rounded-full" 
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-white/50">{xpIntoCurrentLevel} / 200 XP to Level {currentLevel + 1}</p>
            </div>

            <div className="rounded-2xl bg-[#222c3d] p-4 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Daily Streak</span>
                <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white">{stats.streak} Days</div>
              <p className="text-[10px] text-white/50 pt-2">Goal: {stats.cards_studied_today} / {stats.daily_goal} cards today</p>
            </div>

            <div className="rounded-2xl bg-[#222c3d] p-4 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Total Cards</span>
                <Layers className="h-4 w-4 text-blue-300" />
              </div>
              <div className="text-xl font-bold text-white">{allCards.length} Cards</div>
              <p className="text-[10px] text-white/50 pt-2">Across {decks.length} Decks</p>
            </div>
          </div>

          {/* 7-Day Review Forecast */}
          <div className="rounded-2xl bg-[#222c3d] p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-300" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  7-Day Review Forecast
                </h4>
              </div>
              <span className="text-[11px] text-white/50">SM-2 Spaced Schedule</span>
            </div>

            {/* Bar Chart Visualization */}
            <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
              {forecastDays.map((f, idx) => {
                const heightPercent = Math.max(15, Math.round((f.count / maxForecast) * 100));
                const isToday = idx === 0;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-bold text-white/80">{f.count}</span>
                    <div 
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isToday 
                          ? 'bg-amber-400' 
                          : 'bg-white/15 hover:bg-white/25'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[10px] font-semibold ${isToday ? 'text-amber-300' : 'text-white/60'}`}>
                      {f.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Memory Consolidation Breakdown (Mature vs Learning vs New) */}
          <div className="rounded-2xl bg-[#222c3d] p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-emerald-300" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Memory Retention Stages
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-emerald-300">
                {matureCards} Mature Cards ({maturePercent}%)
              </span>
            </div>

            {/* Multi-segment progress bar */}
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5">
              <div 
                className="bg-emerald-400 transition-all" 
                style={{ width: `${maturePercent}%` }} 
                title={`Mature: ${matureCards}`}
              />
              <div 
                className="bg-blue-400 transition-all" 
                style={{ width: `${learningPercent}%` }} 
                title={`Learning: ${learningCards}`}
              />
              <div 
                className="bg-white/20 transition-all" 
                style={{ width: `${newPercent}%` }} 
                title={`New: ${newCards}`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div>
                  <p className="font-bold text-white">{matureCards}</p>
                  <p className="text-[10px] text-white/50">Mature (&ge;21d)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <div>
                  <p className="font-bold text-white">{learningCards}</p>
                  <p className="text-[10px] text-white/50">Learning (1-20d)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                <div>
                  <p className="font-bold text-white">{newCards}</p>
                  <p className="text-[10px] text-white/50">New / Unseen</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="rounded-2xl bg-[#222c3d] p-5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Category Distribution
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div 
                  key={cat} 
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-xs"
                >
                  <span className="text-white/80 font-semibold">{cat}</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
