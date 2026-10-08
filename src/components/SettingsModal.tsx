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
  Check, 
  Sliders,
  ShieldCheck
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
}

export default function SettingsModal({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
  decks,
  onResetDecks,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#18202d] border border-white/10 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1c2534]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/10 shadow-sm">
              <Settings className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">Study Settings</h3>
              <p className="text-xs text-white/60">Preferences, audio effects, and keyboard shortcuts</p>
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
        <div className="p-6 space-y-5">
          
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-[#222c3d] p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 text-amber-300">
                {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-white/40" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Interactive Audio Effects</p>
                <p className="text-[11px] text-white/60">Tactile clicks on flip & success chimes</p>
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                soundOn
                  ? 'bg-emerald-400 text-zinc-950 shadow-sm'
                  : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              {soundOn ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Daily Goal Slider */}
          <div className="rounded-2xl bg-[#222c3d] p-4 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-bold text-white">Daily Card Review Goal</span>
              </div>
              <span className="text-xs font-bold text-amber-300">{dailyGoal} cards / day</span>
            </div>

            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={dailyGoal}
              onChange={(e) => handleGoalChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/40 font-semibold">
              <span>5 cards</span>
              <span>25 cards</span>
              <span>50 cards</span>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="rounded-2xl bg-[#222c3d] p-4 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Keyboard className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Keyboard Shortcuts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between rounded-xl bg-black/20 p-2 border border-white/5">
                <span className="text-white/70">Flip / Check Card</span>
                <kbd className="rounded bg-white/15 px-2 py-0.5 font-mono text-[10px] text-amber-200">Space</kbd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 p-2 border border-white/5">
                <span className="text-white/70">Rate Spaced Recall</span>
                <kbd className="rounded bg-white/15 px-2 py-0.5 font-mono text-[10px] text-amber-200">1 - 4</kbd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 p-2 border border-white/5">
                <span className="text-white/70">Next Question</span>
                <kbd className="rounded bg-white/15 px-2 py-0.5 font-mono text-[10px] text-amber-200">&rarr; or Enter</kbd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 p-2 border border-white/5">
                <span className="text-white/70">Close Modal</span>
                <kbd className="rounded bg-white/15 px-2 py-0.5 font-mono text-[10px] text-amber-200">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Data Backup & Reset */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={handleExportBackup}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-xs font-semibold text-white transition border border-white/10 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-blue-300" />
              <span>{copiedBackup ? 'Downloaded!' : 'Export All Decks (JSON)'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset your library back to the default study decks?')) {
                  onResetDecks();
                  onClose();
                }
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 px-4 py-2.5 text-xs font-semibold text-red-300 transition border border-red-500/20 cursor-pointer"
              title="Reset Decks"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
