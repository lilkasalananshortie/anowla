'use client';

import React, { useState } from 'react';
import { Folder } from '@/types';
import { 
  X, 
  FolderPlus, 
  Folder as FolderIcon, 
  Check 
} from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folder: Folder) => void;
}

const STUDY_PRESETS = [
  { name: 'Computer Science', icon: 'Code', color: '#22396f' },
  { name: 'Cognitive Science', icon: 'Brain', color: '#0d1c42' },
  { name: 'Modern History', icon: 'Globe', color: '#fcf1d0' },
  { name: 'Molecular Biology', icon: 'Dna', color: '#22396f' },
  { name: 'Mathematics & Logic', icon: 'BookOpen', color: '#fcf1d0' },
  { name: 'Philosophy & Ethics', icon: 'FolderIcon', color: '#0d1c42' },
];

const COLOR_OPTIONS = [
  { name: 'Cobalt Slate', hex: '#22396f' },
  { name: 'Warm Cream', hex: '#fcf1d0' },
  { name: 'Deep Royal', hex: '#0d1c42' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
];

export default function CreateFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#22396f');
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('Please provide a folder name.');
      return;
    }

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: folderName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      created_at: new Date().toISOString(),
    };

    onCreateFolder(newFolder);
    setFolderName('');
    setError(null);
    onClose();
  };

  const handleSelectPreset = (preset: typeof STUDY_PRESETS[0]) => {
    setFolderName(preset.name);
    setSelectedIcon(preset.icon);
    setSelectedColor(preset.color);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010736]/80 p-4 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#0d1c42] p-6 shadow-2xl border border-[#22396f] text-[#fcf1d0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#22396f] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#22396f] text-[#fcf1d0] shadow-md">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#fcf1d0] tracking-tight">
                Create Study Folder
              </h2>
              <p className="text-xs text-[#fcf1d0]/70">
                Organize decks and PDFs by topic, course, or subject
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#fcf1d0]/70 hover:bg-white/5 hover:text-[#fcf1d0] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-950/40 p-2.5 text-xs font-semibold text-rose-300 border border-rose-800/60">
              {error}
            </div>
          )}

          {/* Folder Name Input */}
          <div>
            <label className="block text-xs font-bold text-[#fcf1d0] uppercase tracking-wider mb-1">
              Folder Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Cognitive Science or Computer Systems"
              className="w-full rounded-xl border border-[#22396f] bg-[#010736] px-3.5 py-2.5 text-sm text-[#fcf1d0] placeholder-[#fcf1d0]/40 outline-none focus:border-[#fcf1d0] transition-colors"
            />
          </div>

          {/* Study Presets */}
          <div>
            <label className="block text-[11px] font-bold text-[#fcf1d0]/70 uppercase tracking-wider mb-1.5">
              Quick Suggestions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STUDY_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold border transition cursor-pointer ${
                    folderName === preset.name
                      ? 'bg-[#22396f] text-[#fcf1d0] border-[#fcf1d0]'
                      : 'bg-[#010736] text-[#fcf1d0] border-[#22396f] hover:bg-white/5'
                  }`}
                >
                  <FolderIcon size={14} className={folderName === preset.name ? 'text-[#fcf1d0]' : 'text-[#fcf1d0]/60'} />
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Tag Selection */}
          <div>
            <label className="block text-[11px] font-bold text-[#fcf1d0]/70 uppercase tracking-wider mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    selectedColor === c.hex ? 'scale-110 border-[#fcf1d0]' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor === c.hex && (
                    <Check size={12} className={c.hex === '#fcf1d0' ? 'text-[#010736]' : 'text-white'} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#22396f] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#fcf1d0]/70 hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#fcf1d0] text-[#010736] hover:bg-white transition-all shadow-md cursor-pointer"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
