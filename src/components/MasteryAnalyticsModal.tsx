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
  Award
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

  const totalCards = allCards.length || 1;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010736]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0d1c42] border border-[#22396f] shadow-2xl text-[#fcf1d0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#22396f] bg-[#010736]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d1c42] text-[#fcf1d0] border border-[#22396f]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#fcf1d0]">
                Retention & Analytics
              </h3>
              <p className="text-xs text-[#fcf1d0]/60">
                Card maturity buckets and 7-day review forecast
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d1c42] text-[#fcf1d0]/70 hover:text-[#fcf1d0] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Level & Streak Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#010736] p-4 border border-[#22396f] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#fcf1d0]/60">
                <span>Academic Rank</span>
                <Award className="h-4 w-4 text-[#fcf1d0]" />
              </div>
              <div className="text-xl font-bold text-[#fcf1d0]">Level {currentLevel}</div>
              <div className="h-1.5 w-full bg-[#0d1c42] rounded-full overflow-hidden mt-2 border border-[#22396f]">
                <div 
                  className="h-full bg-[#fcf1d0] rounded-full" 
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-[#fcf1d0]/50">{xpIntoCurrentLevel} / 200 XP to Level {currentLevel + 1}</p>
            </div>

            <div className="rounded-2xl bg-[#010736] p-4 border border-[#22396f] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#fcf1d0]/60">
                <span>Daily Streak</span>
                <Flame className="h-4 w-4 fill-[#fcf1d0] text-[#fcf1d0]" />
              </div>
              <div className="text-xl font-bold text-[#fcf1d0]">{stats.streak} Days</div>
              <p className="text-[10px] text-[#fcf1d0]/50 pt-2">Goal: {stats.cards_studied_today} / {stats.daily_goal} cards today</p>
            </div>

            <div className="rounded-2xl bg-[#010736] p-4 border border-[#22396f] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#fcf1d0]/60">
                <span>Total Cards</span>
                <Layers className="h-4 w-4 text-[#fcf1d0]" />
              </div>
              <div className="text-xl font-bold text-[#fcf1d0]">{allCards.length} Cards</div>
              <p className="text-[10px] text-[#fcf1d0]/50 pt-2">Across {decks.length} Decks</p>
            </div>
          </div>

          {/* 7-Day Review Forecast */}
          <div className="rounded-2xl bg-[#010736] p-5 border border-[#22396f] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#fcf1d0]" />
                <h4 className="text-xs font-bold text-[#fcf1d0] uppercase tracking-wider">
                  7-Day Review Forecast
                </h4>
              </div>
              <span className="text-[11px] text-[#fcf1d0]/50">SM-2 Spaced Schedule</span>
            </div>

            {/* Bar Chart Visualization */}
            <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
              {forecastDays.map((f, idx) => {
                const heightPercent = Math.max(15, Math.round((f.count / maxForecast) * 100));
                const isToday = idx === 0;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-bold text-[#fcf1d0]/80">{f.count}</span>
                    <div 
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isToday 
                          ? 'bg-[#fcf1d0]' 
                          : 'bg-[#22396f] hover:bg-[#22396f]/80'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[10px] font-semibold ${isToday ? 'text-[#fcf1d0]' : 'text-[#fcf1d0]/60'}`}>
                      {f.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Memory Retention Stages */}
          <div className="rounded-2xl bg-[#010736] p-5 border border-[#22396f] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#fcf1d0]" />
                <h4 className="text-xs font-bold text-[#fcf1d0] uppercase tracking-wider">
                  Memory Retention Stages
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-[#fcf1d0]">
                {matureCards} Mature Cards ({maturePercent}%)
              </span>
            </div>

            {/* Multi-segment progress bar */}
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-[#0d1c42] border border-[#22396f]">
              <div 
                className="bg-[#fcf1d0] transition-all" 
                style={{ width: `${maturePercent}%` }} 
                title={`Mature: ${matureCards}`}
              />
              <div 
                className="bg-[#22396f] transition-all" 
                style={{ width: `${learningPercent}%` }} 
                title={`Learning: ${learningCards}`}
              />
              <div 
                className="bg-[#0d1c42] transition-all" 
                style={{ width: `${newPercent}%` }} 
                title={`New: ${newCards}`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#fcf1d0]" />
                <div>
                  <p className="font-bold text-[#fcf1d0]">{matureCards}</p>
                  <p className="text-[10px] text-[#fcf1d0]/50">Mature (&ge;21d)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22396f]" />
                <div>
                  <p className="font-bold text-[#fcf1d0]">{learningCards}</p>
                  <p className="text-[10px] text-[#fcf1d0]/50">Learning (1-20d)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22396f]/40" />
                <div>
                  <p className="font-bold text-[#fcf1d0]">{newCards}</p>
                  <p className="text-[10px] text-[#fcf1d0]/50">New / Unseen</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="rounded-2xl bg-[#010736] p-5 border border-[#22396f] space-y-3">
            <h4 className="text-xs font-bold text-[#fcf1d0] uppercase tracking-wider">
              Category Distribution
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div 
                  key={cat} 
                  className="flex items-center gap-2 rounded-xl bg-[#0d1c42] px-3 py-1.5 border border-[#22396f] text-xs"
                >
                  <span className="text-[#fcf1d0] font-semibold">{cat}</span>
                  <span className="rounded-full bg-[#010736] px-2 py-0.5 text-[10px] font-bold text-[#fcf1d0] border border-[#22396f]">
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
