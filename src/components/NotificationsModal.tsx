'use client';

import React from 'react';
import { X, Bell, Flame, BookOpen, Sparkles } from 'lucide-react';
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
      title: 'Daily Streak',
      desc: `Active ${stats.streak}-day streak. Review a card today to maintain your cadence.`,
      icon: Flame,
      color: 'text-[#fcf1d0] bg-[#0d1c42] border-[#22396f]',
      time: 'Today',
    },
    {
      id: 'n2',
      title: `${totalDue > 0 ? `${totalDue} Cards Due Today` : 'No Cards Due'}`,
      desc: totalDue > 0 
        ? 'Spaced interval cards are ready for optimal retrieval practice.'
        : 'All reviews are completed for today.',
      icon: BookOpen,
      color: 'text-[#fcf1d0] bg-[#0d1c42] border-[#22396f]',
      time: '1h ago',
    },
    {
      id: 'n3',
      title: 'PDF & Lecture Import',
      desc: 'Upload lecture slides or paste article links to extract study cards.',
      icon: Sparkles,
      color: 'text-[#fcf1d0] bg-[#0d1c42] border-[#22396f]',
      time: 'Active',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010736]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#0d1c42] border border-[#22396f] shadow-2xl text-[#fcf1d0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#22396f] bg-[#010736]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d1c42] text-[#fcf1d0] border border-[#22396f] shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#fcf1d0]">Notifications</h3>
              <p className="text-xs text-[#fcf1d0]/60">Study alerts, streak updates, and milestones</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d1c42] text-[#fcf1d0]/70 hover:text-[#fcf1d0] transition cursor-pointer"
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
                className="rounded-2xl bg-[#010736] p-4 border border-[#22396f] flex items-start gap-3.5 hover:border-[#fcf1d0]/40 transition"
              >
                <div className={`p-2 rounded-xl border shrink-0 ${n.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#fcf1d0]">{n.title}</h4>
                    <span className="text-[10px] text-[#fcf1d0]/50 font-semibold">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-[#fcf1d0]/70 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#22396f] bg-[#010736]/60 text-center">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#010736] hover:bg-[#010736]/80 py-2.5 text-xs font-semibold text-[#fcf1d0] border border-[#22396f] transition cursor-pointer"
          >
            Close Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
