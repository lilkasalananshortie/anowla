'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Target, 
  Keyboard, 
  Download, 
  Trash2, 
  RotateCcw
} from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '@/lib/audioService';
import { Deck, UserStats } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  decks: Deck[];
  onResetDecks: () => void;
  onClearDecks?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
  decks,
  onResetDecks,
  onClearDecks,
}: SettingsModalProps) {
  const [soundOn, setSoundOn] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(stats.daily_goal || 10);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSoundOn(isSoundEnabled());
      setDailyGoal(stats.daily_goal || 10);
    }
  }, [isOpen, stats.daily_goal]);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const handleGoalChange = (newGoal: number) => {
    setDailyGoal(newGoal);
    onUpdateStats({
      ...stats,
      daily_goal: newGoal,
    });
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(decks, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.setAttribute('download', `alwinyah_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010736]/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#0d1c42] border border-[#22396f] shadow-2xl text-[#fcf1d0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#22396f] bg-[#010736]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d1c42] text-[#fcf1d0] border border-[#22396f]">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#fcf1d0]">Study Settings</h3>
              <p className="text-xs text-[#fcf1d0]/60">Audio feedback, daily quotas, and data management</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#fcf1d0]/70 hover:text-[#fcf1d0] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-[#010736] p-4 border border-[#22396f]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#0d1c42] text-[#fcf1d0] border border-[#22396f]">
                {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-[#fcf1d0]/50" />}
              </div>
              <div>
                <p className="text-xs font-bold text-[#fcf1d0]">Tactile Audio Feedback</p>
                <p className="text-[11px] text-[#fcf1d0]/60">Subtle sound feedback on card flips and completions</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleSound}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                soundOn
                  ? 'bg-[#fcf1d0] text-[#010736]'
                  : 'bg-[#0d1c42] text-[#fcf1d0]/60 border border-[#22396f] hover:text-[#fcf1d0]'
              }`}
            >
              {soundOn ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Daily Goal Slider */}
          <div className="rounded-2xl bg-[#010736] p-4 border border-[#22396f] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#fcf1d0]" />
                <span className="text-xs font-bold text-[#fcf1d0]">Daily Card Review Goal</span>
              </div>
              <span className="text-xs font-bold text-[#fcf1d0]">{dailyGoal} cards / day</span>
            </div>

            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={dailyGoal}
              onChange={(e) => handleGoalChange(Number(e.target.value))}
              className="w-full accent-[#fcf1d0] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#fcf1d0]/50 font-semibold">
              <span>5 cards</span>
              <span>25 cards</span>
              <span>50 cards</span>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="rounded-2xl bg-[#010736] p-4 border border-[#22396f] space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Keyboard className="h-4 w-4 text-[#fcf1d0]" />
              <span className="text-xs font-bold text-[#fcf1d0] uppercase tracking-wider">
                Keyboard Shortcuts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between rounded-xl bg-[#0d1c42] p-2 border border-[#22396f]">
                <span className="text-[#fcf1d0]/70">Flip / Check Card</span>
                <kbd className="rounded bg-[#010736] px-2 py-0.5 font-mono text-[10px] text-[#fcf1d0] border border-[#22396f]">Space</kbd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#0d1c42] p-2 border border-[#22396f]">
                <span className="text-[#fcf1d0]/70">Rate Spaced Recall</span>
                <kbd className="rounded bg-[#010736] px-2 py-0.5 font-mono text-[10px] text-[#fcf1d0] border border-[#22396f]">1 - 4</kbd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#0d1c42] p-2 border border-[#22396f]">
                <span className="text-[#fcf1d0]/70">Next Question</span>
                <kbd className="rounded bg-[#010736] px-2 py-0.5 font-mono text-[10px] text-[#fcf1d0] border border-[#22396f]">&rarr; or Enter</kbd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#0d1c42] p-2 border border-[#22396f]">
                <span className="text-[#fcf1d0]/70">Close Modal</span>
                <kbd className="rounded bg-[#010736] px-2 py-0.5 font-mono text-[10px] text-[#fcf1d0] border border-[#22396f]">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Data Backup & Library Controls */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#010736] hover:bg-[#010736]/80 py-2.5 text-xs font-semibold text-[#fcf1d0] transition border border-[#22396f] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#fcf1d0]" />
                <span>{copiedBackup ? 'Downloaded Backup!' : 'Export Decks (JSON)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Permanently remove all sample decks from your library?')) {
                    if (onClearDecks) onClearDecks();
                    onClose();
                  }
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 px-3.5 py-2.5 text-xs font-semibold text-rose-200 transition border border-rose-800 cursor-pointer"
                title="Remove All Decks"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Decks</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset your library back to the default sample study decks?')) {
                    onResetDecks();
                    onClose();
                  }
                }}
                className="text-[11px] font-semibold text-[#fcf1d0]/60 hover:text-[#fcf1d0] inline-flex items-center gap-1 cursor-pointer pt-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restore Default Sample Decks</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
