'use client';

import React, { useState } from 'react';
import { Folder } from '@/types';
import { 
  X, 
  FolderPlus, 
  Folder as FolderIcon, 
  Check, 
  Stethoscope, 
  Pill, 
  ClipboardCheck, 
  HeartPulse, 
  Baby, 
  BrainCircuit 
} from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folder: Folder) => void;
}

const STUDY_PRESETS = [
  { name: 'Computer Science', icon: 'Code', color: '#84a282' },
  { name: 'Cognitive Science', icon: 'Brain', color: '#6e8c6c' },
  { name: 'Modern History', icon: 'Globe', color: '#b8cfb3' },
  { name: 'Molecular Biology', icon: 'Dna', color: '#84a282' },
  { name: 'Mathematics & Logic', icon: 'BookOpen', color: '#f6e2e9' },
  { name: 'Philosophy & Ethics', icon: 'FolderIcon', color: '#405944' },
];

const COLOR_OPTIONS = [
  { name: 'Sage Primary', hex: '#84a282' },
  { name: 'Deep Forest', hex: '#405944' },
  { name: 'Soft Sage', hex: '#b8cfb3' },
  { name: 'Blush Rose', hex: '#f6e2e9' },
  { name: 'Warm Cream', hex: '#dfe8dc' },
];

export default function CreateFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#84a282');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141d16]/75 p-4 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#fefaf3] p-6 shadow-2xl border border-[#dfe8dc] text-[#19251a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dfe8dc] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#84a282] text-white shadow-md shadow-[#84a282]/30">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#19251a] tracking-tight">
                Create Study Folder
              </h2>
              <p className="text-xs text-[#586c5a]">
                Organize your decks and PDFs by topic, course, or exam
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#586c5a] hover:bg-black/5 hover:text-[#19251a] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {/* Folder Name Input */}
          <div>
            <label className="block text-xs font-bold text-[#19251a] uppercase tracking-wider mb-1">
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
              className="w-full rounded-xl border border-[#dfe8dc] bg-white px-3.5 py-2.5 text-sm text-[#19251a] placeholder:text-[#586c5a]/50 outline-none focus:border-[#84a282] focus:ring-1 focus:ring-[#84a282] transition-colors"
            />
          </div>

          {/* Study Presets */}
          <div>
            <label className="block text-[11px] font-bold text-[#586c5a] uppercase tracking-wider mb-1.5">
              Quick Study Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STUDY_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold border transition cursor-pointer ${
                    folderName === preset.name
                      ? 'bg-[#84a282] text-white border-[#84a282]'
                      : 'bg-white text-[#19251a] border-[#dfe8dc] hover:bg-[#ebf2e9]'
                  }`}
                >
                  <FolderIcon size={14} className={folderName === preset.name ? 'text-white' : 'text-[#84a282]'} />
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Tag Selection */}
          <div>
            <label className="block text-[11px] font-bold text-[#586c5a] uppercase tracking-wider mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    selectedColor === c.hex ? 'scale-110 border-[#19251a]' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor === c.hex && (
                    <Check size={12} className={c.hex === '#f6e2e9' || c.hex === '#dfe8dc' ? 'text-[#19251a]' : 'text-white'} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#dfe8dc] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#586c5a] hover:bg-black/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#84a282] text-white hover:bg-[#6e8c6c] transition-all shadow-md shadow-[#84a282]/25 cursor-pointer"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
