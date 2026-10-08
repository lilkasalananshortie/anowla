'use client';

import React from 'react';
import { X, Bell, Flame, BookOpen, Sparkles, Check, Clock } from 'lucide-react';
import { UserStats, Deck } from '@/types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  decks: Deck[];
}

export default function NotificationsModal({
  isOpen,
  onClose,
  stats,
  decks,
}: NotificationsModalProps) {
  if (!isOpen) return null;

  const totalDue = decks.reduce((acc, d) => acc + (d.due_count || 0), 0);

  const notifications = [
    {
      id: 'n1',
      title: 'Maintain Your Study Streak',
      desc: `You have an active ${stats.streak}-day streak! Review a card today to keep your streak alive.`,
      icon: Flame,
      color: 'text-amber-400 bg-amber-500/20 border-amber-400/20',
      time: 'Today',
    },
    {
      id: 'n2',
      title: `${totalDue > 0 ? `${totalDue} Cards Due for Review` : 'All Caught Up!'}`,
      desc: totalDue > 0 
        ? `Cards in your library are ready for spaced repetition recall according to your SM-2 schedule.`
        : 'You have zero cards pending review today. Great work staying ahead!',
      icon: BookOpen,
      color: 'text-blue-400 bg-blue-500/20 border-blue-400/20',
      time: '1h ago',
    },
    {
      id: 'n3',
      title: 'YouTube & Web to Flashcards Now Live',
      desc: 'You can now paste YouTube lecture videos or Wikipedia links to auto-generate full decks.',
      icon: Sparkles,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-400/20',
      time: 'New',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#18202d] border border-white/10 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1c2534]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/10 shadow-sm">
              <Bell className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">Notifications</h3>
              <p className="text-xs text-white/60">Study alerts, streak updates, and milestones</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div 
                key={n.id} 
                className="rounded-2xl bg-[#222c3d] p-4 border border-white/10 flex items-start gap-3.5 hover:border-white/20 transition"
              >
                <div className={`p-2 rounded-xl border shrink-0 ${n.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{n.title}</h4>
                    <span className="text-[10px] text-white/40 font-semibold">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#192230] text-center">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-white/10 hover:bg-white/15 py-2 text-xs font-semibold text-white/80 hover:text-white transition cursor-pointer"
          >
            Close Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
