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
  RotateCcw,
  Check, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141d16]/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#fefaf3] border border-[#dfe8dc] shadow-2xl text-[#19251a] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#dfe8dc] bg-[#ebf2e9]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#84a282] text-white shadow-md shadow-[#84a282]/25">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#19251a]">Study Settings</h3>
              <p className="text-xs text-[#586c5a]">Preferences, audio feedback, and study quota</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#586c5a] hover:bg-black/5 hover:text-[#19251a] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#dfe8dc] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#ebf2e9] text-[#84a282]">
                {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-[#586c5a]" />}
              </div>
              <div>
                <p className="text-xs font-bold text-[#19251a]">Tactile Audio Feedback</p>
                <p className="text-[11px] text-[#586c5a]">Subtle clicks on card flip & mastery chimes</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleSound}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                soundOn
                  ? 'bg-[#84a282] text-white shadow-xs'
                  : 'bg-[#ebf2e9] text-[#586c5a] hover:text-[#19251a]'
              }`}
            >
              {soundOn ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Daily Goal Slider */}
          <div className="rounded-2xl bg-white p-4 border border-[#dfe8dc] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#84a282]" />
                <span className="text-xs font-bold text-[#19251a]">Daily Card Review Goal</span>
              </div>
              <span className="text-xs font-bold text-[#84a282]">{dailyGoal} cards / day</span>
            </div>

            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={dailyGoal}
              onChange={(e) => handleGoalChange(Number(e.target.value))}
              className="w-full accent-[#84a282] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#586c5a] font-semibold">
              <span>5 cards</span>
              <span>25 cards</span>
              <span>50 cards</span>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="rounded-2xl bg-white p-4 border border-[#dfe8dc] shadow-xs space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Keyboard className="h-4 w-4 text-[#84a282]" />
              <span className="text-xs font-bold text-[#19251a] uppercase tracking-wider">
                Keyboard Shortcuts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between rounded-xl bg-[#fefaf3] p-2 border border-[#dfe8dc]">
                <span className="text-[#586c5a]">Flip / Check Card</span>
                <kbd className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-[#19251a] border border-[#dfe8dc]">Space</kbd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#fefaf3] p-2 border border-[#dfe8dc]">
                <span className="text-[#586c5a]">Rate Spaced Recall</span>
                <kbd className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-[#19251a] border border-[#dfe8dc]">1 - 4</kbd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#fefaf3] p-2 border border-[#dfe8dc]">
                <span className="text-[#586c5a]">Next Question</span>
                <kbd className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-[#19251a] border border-[#dfe8dc]">&rarr; or Enter</kbd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#fefaf3] p-2 border border-[#dfe8dc]">
                <span className="text-[#586c5a]">Close Modal</span>
                <kbd className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-[#19251a] border border-[#dfe8dc]">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Data Backup & Library Controls */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-[#ebf2e9] py-2.5 text-xs font-semibold text-[#19251a] transition border border-[#dfe8dc] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#84a282]" />
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
                className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 px-3.5 py-2.5 text-xs font-semibold text-rose-700 transition border border-rose-200 cursor-pointer"
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
                  if (confirm('Reset your library back to the default sample clinical decks?')) {
                    onResetDecks();
                    onClose();
                  }
                }}
                className="text-[11px] font-semibold text-[#586c5a] hover:text-[#19251a] inline-flex items-center gap-1 cursor-pointer pt-1"
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
