'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Deck, ReviewRating, CardType } from '@/types';
import { calculateNextReview } from '@/lib/srs';
import { 
  ArrowLeft, 
  RotateCw, 
  Check, 
  X, 
  Trophy, 
  ChevronRight, 
  Sparkles, 
  Brain, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Send, 
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  playCardFlipSound, 
  playSuccessChime, 
  playErrorTone, 
  playFanfare 
} from '@/lib/audioService';

interface StudySessionProps {
  deck: Deck;
  onExit: () => void;
  onSessionComplete: (xpGained: number, cardsStudied: number) => void;
}

type StudyMode = 'native' | 'flashcard' | 'multiple_choice' | 'fill_blank';

export default function StudySession({ deck, onExit, onSessionComplete }: StudySessionProps) {
  const cards: Card[] = deck.cards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Study mode selection
  const [studyMode, setStudyMode] = useState<StudyMode>('native');

  // Flashcard flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // Multiple choice state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Typing recall state
  const [typedAnswer, setTypedAnswer] = useState('');

  // Answer validation states
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Audio toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Session metrics & combo streak
  const [correctCount, setCorrectCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // AI Tutor drawer states
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [customTutorQuery, setCustomTutorQuery] = useState('');
  const [activeChip, setActiveChip] = useState<'explain' | 'mnemonic' | 'example' | 'custom'>('explain');

  const currentCard = cards[currentIndex];

  // Determine active mode for this specific card
  const effectiveMode: 'flashcard' | 'multiple_choice' | 'fill_blank' = useMemo(() => {
    if (studyMode === 'native') {
      return currentCard?.card_type || 'flashcard';
    }
    return studyMode;
  }, [studyMode, currentCard]);

  // Options for multiple choice (uses distractors or creates automatic choices from other cards in the deck)
  const options = useMemo(() => {
    if (!currentCard) return [];

    let pool: string[] = [];
    if (currentCard.distractors && currentCard.distractors.length > 0) {
      pool = [currentCard.back, ...currentCard.distractors];
    } else {
      // Pick random distinct answers from other cards in this deck as distractors
      const otherAnswers = cards
        .filter((c) => c.id !== currentCard.id && c.back.trim() !== currentCard.back.trim())
        .map((c) => c.back);
      const shuffledOthers = otherAnswers.sort(() => Math.random() - 0.5).slice(0, 3);
      pool = [currentCard.back, ...shuffledOthers];
    }

    // Ensure uniqueness and shuffle
    const unique = Array.from(new Set(pool));
    return unique.sort(() => Math.random() - 0.5);
  }, [currentIndex, currentCard, cards]);

  // Text to speech helper
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-white">
        <p className="text-white/70">This deck has no cards to study yet!</p>
        <button
          onClick={onExit}
          className="mt-4 rounded-xl bg-white px-5 py-2 text-xs font-bold text-zinc-950 cursor-pointer shadow-md"
        >
          Return to Decks
        </button>
      </div>
    );
  }

  // SM-2 Spaced Repetition rating
  const handleRating = (rating: ReviewRating) => {
    const updated = calculateNextReview(currentCard, rating);
    Object.assign(currentCard, updated);

    if (rating >= 3) {
      setCorrectCount((prev) => prev + 1);
      setComboStreak((prev) => {
        const next = prev + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
      if (soundEnabled) playSuccessChime();
    } else {
      setComboStreak(0);
      if (soundEnabled) playErrorTone();
    }
    advanceCard();
  };

  const handleSelectOption = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
    setIsAnswerChecked(true);

    const match = option.trim().toLowerCase() === currentCard.back.trim().toLowerCase();
    setIsCorrect(match);
    if (match) {
      setCorrectCount((prev) => prev + 1);
      setComboStreak((prev) => {
        const next = prev + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
      if (soundEnabled) playSuccessChime();
    } else {
      setComboStreak(0);
      if (soundEnabled) playErrorTone();
    }
  };

  const handleCheckTypedAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswerChecked || !typedAnswer.trim()) return;
    setIsAnswerChecked(true);

    const match = typedAnswer.trim().toLowerCase() === currentCard.back.trim().toLowerCase();
    setIsCorrect(match);
    if (match) {
      setCorrectCount((prev) => prev + 1);
      setComboStreak((prev) => {
        const next = prev + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
      if (soundEnabled) playSuccessChime();
    } else {
      setComboStreak(0);
      if (soundEnabled) playErrorTone();
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (effectiveMode === 'flashcard') {
          setIsFlipped((prev) => {
            if (!prev) playCardFlipSound();
            return !prev;
          });
        }
      } else if (e.key === '1' && isFlipped && effectiveMode === 'flashcard') {
        handleRating(1);
      } else if (e.key === '2' && isFlipped && effectiveMode === 'flashcard') {
        handleRating(2);
      } else if (e.key === '3' && isFlipped && effectiveMode === 'flashcard') {
        handleRating(3);
      } else if (e.key === '4' && isFlipped && effectiveMode === 'flashcard') {
        handleRating(4);
      } else if ((e.key === 'ArrowRight' || e.key === 'Enter') && isAnswerChecked) {
        advanceCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [effectiveMode, isFlipped, isAnswerChecked, currentCard]);

  const advanceCard = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    setTypedAnswer('');
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setIsTutorOpen(false);
    setTutorResponse(null);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    setIsFinished(true);
    const bonusXp = bestCombo * 15;
    const xp = cards.length * 20 + bonusXp;
    onSessionComplete(xp, cards.length);

    if (soundEnabled) playFanfare();
    try {
      // Left cannon
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { x: 0.2, y: 0.65 },
        colors: ['#84a282', '#b8cfb3', '#f6e2e9', '#fefaf3', '#f59e0b'],
      });
      // Right cannon
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { x: 0.8, y: 0.65 },
        colors: ['#84a282', '#b8cfb3', '#f6e2e9', '#fefaf3', '#10b981'],
      });
    } catch (e) {}
  };

  // AI Tutor invocation
  const handleAskTutor = async (type: 'explain' | 'mnemonic' | 'example' | 'custom', customText?: string) => {
    setActiveChip(type);
    setIsTutorOpen(true);
    setTutorLoading(true);
    setTutorResponse(null);

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentCard.front,
          answer: currentCard.back,
          promptType: type,
          customQuery: customText || customTutorQuery,
        }),
      });

      const data = await res.json();
      if (res.ok && data.explanation) {
        setTutorResponse(data.explanation);
      } else {
        setTutorResponse(data.error || 'Tutor could not generate an explanation at this time.');
      }
    } catch (err: any) {
      setTutorResponse('Failed to reach AI Tutor. Please check your connection.');
    } finally {
      setTutorLoading(false);
    }
  };

  // Finished session screen
  if (isFinished) {
    const accuracy = Math.round((correctCount / cards.length) * 100);
    const bonusXp = bestCombo * 15;
    const xpGained = cards.length * 20 + bonusXp;

    return (
      <div className="mx-auto max-w-lg rounded-3xl bg-[#0d1c42] p-8 text-center text-[#fcf1d0] border border-[#22396f] shadow-2xl animate-pop-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#22396f] text-[#fcf1d0] border border-[#22396f] shadow-lg">
          <Trophy className="h-8 w-8 text-[#fcf1d0]" />
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#fcf1d0]">Study Session Complete</h2>
        <p className="mt-1 text-xs text-[#fcf1d0]/70">
          Review intervals updated according to the SM-2 spaced repetition protocol.
        </p>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-4 gap-2.5 rounded-2xl bg-[#010736] p-4 border border-[#22396f]">
          <div>
            <div className="text-lg font-bold text-[#fcf1d0]">+{xpGained}</div>
            <div className="text-[10px] text-[#fcf1d0]/60">XP Earned</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400">{accuracy}%</div>
            <div className="text-[10px] text-[#fcf1d0]/60">Accuracy</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#fcf1d0]">{bestCombo}x</div>
            <div className="text-[10px] text-[#fcf1d0]/60">Best Streak</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#fcf1d0]">{cards.length}</div>
            <div className="text-[10px] text-[#fcf1d0]/60">Cards Studied</div>
          </div>
        </div>

        <button
          onClick={onExit}
          className="mt-6 w-full rounded-2xl bg-[#fcf1d0] hover:bg-white py-3.5 text-xs font-bold text-[#010736] shadow-lg transition cursor-pointer active:scale-98"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="mx-auto max-w-2xl text-[#fcf1d0] font-sans">
      
      {/* 1. TOP SESSION BAR & MODE SWITCHER */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-full bg-[#0d1c42] px-3.5 py-1.5 text-xs font-semibold text-[#fcf1d0] hover:bg-[#22396f] transition cursor-pointer border border-[#22396f]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit</span>
          </button>

          <span className="text-xs font-bold text-[#fcf1d0] truncate max-w-[180px]">
            {deck.title}
          </span>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-full border transition cursor-pointer ${
              soundEnabled
                ? 'bg-[#22396f] border-[#fcf1d0]/50 text-[#fcf1d0]'
                : 'bg-[#010736] border-[#22396f] text-[#fcf1d0]/40'
            }`}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>

        {/* Study Mode Selector Pills */}
        <div className="flex items-center gap-1 rounded-full bg-[#0d1c42] p-1 border border-[#22396f] text-[11px] font-semibold">
          <button
            onClick={() => setStudyMode('native')}
            className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
              studyMode === 'native' ? 'bg-[#22396f] text-[#fcf1d0] font-bold shadow-xs' : 'text-[#fcf1d0]/60 hover:text-[#fcf1d0]'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => setStudyMode('flashcard')}
            className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
              studyMode === 'flashcard' ? 'bg-[#22396f] text-[#fcf1d0] font-bold shadow-xs' : 'text-[#fcf1d0]/60 hover:text-[#fcf1d0]'
            }`}
          >
            Flip
          </button>
          <button
            onClick={() => setStudyMode('multiple_choice')}
            className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
              studyMode === 'multiple_choice' ? 'bg-[#22396f] text-[#fcf1d0] font-bold shadow-xs' : 'text-[#fcf1d0]/60 hover:text-[#fcf1d0]'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setStudyMode('fill_blank')}
            className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
              studyMode === 'fill_blank' ? 'bg-[#22396f] text-[#fcf1d0] font-bold shadow-xs' : 'text-[#fcf1d0]/60 hover:text-[#fcf1d0]'
            }`}
          >
            Type
          </button>
        </div>
      </div>

      {/* Progress Bar & Combo Streak */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#010736] border border-[#22396f]">
            <div 
              className="h-full bg-[#fcf1d0] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-[#fcf1d0] whitespace-nowrap">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {comboStreak >= 2 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22396f] border border-[#fcf1d0]/40 text-[#fcf1d0] shadow-md shrink-0">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-black tracking-tight">{comboStreak}x Streak!</span>
            <span className="text-[10px] font-semibold text-[#fcf1d0]/80">+{comboStreak * 25} XP</span>
          </div>
        )}
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="relative min-h-[320px] rounded-3xl bg-[#0d1c42] p-6 sm:p-8 shadow-2xl border border-[#22396f] flex flex-col justify-between">
        
        {/* Card Header Tag & TTS */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#010736] px-3 py-1 font-bold text-[#fcf1d0] border border-[#22396f]">
              {effectiveMode === 'multiple_choice' 
                ? 'Multiple Choice Quiz' 
                : effectiveMode === 'fill_blank' 
                ? 'Typing Recall' 
                : 'Flashcard'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => speakText(currentCard.front)}
              className="p-1.5 rounded-full bg-[#010736] text-[#fcf1d0]/70 hover:text-[#fcf1d0] hover:bg-white/5 transition cursor-pointer"
              title="Pronounce question"
            >
              <Volume2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleAskTutor('explain')}
              className="flex items-center gap-1 rounded-full bg-[#22396f] hover:bg-[#22396f]/80 px-3 py-1 text-[11px] font-bold text-[#fcf1d0] border border-[#fcf1d0]/30 transition cursor-pointer"
              title="Ask AI Tutor for explanation"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#fcf1d0]" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="my-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#fcf1d0]/60">Question</span>
          <h2 className="mt-1 text-lg sm:text-xl font-bold text-[#fcf1d0] leading-snug">
            {currentCard.front}
          </h2>
        </div>

        {/* 3. INTERACTIVE STUDY MODE BODY */}

        {/* A. Multiple Choice Mode */}
        {effectiveMode === 'multiple_choice' && (
          <div className="grid grid-cols-1 gap-2.5 my-2">
            {options.map((option, idx) => {
              let btnStyle = "border-[#22396f] bg-[#010736] hover:border-[#fcf1d0]/60 text-[#fcf1d0]";

              if (isAnswerChecked) {
                if (option.trim().toLowerCase() === currentCard.back.trim().toLowerCase()) {
                  btnStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold border-2 animate-pop-in";
                } else if (selectedOption === option) {
                  btnStyle = "border-rose-500 bg-rose-950/40 text-rose-200 border-2 animate-shake";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerChecked}
                  onClick={() => handleSelectOption(option)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition cursor-pointer active:scale-98 ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswerChecked && option.trim().toLowerCase() === currentCard.back.trim().toLowerCase() && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerChecked && selectedOption === option && option.trim().toLowerCase() !== currentCard.back.trim().toLowerCase() && (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* B. Typing Recall Mode */}
        {effectiveMode === 'fill_blank' && (
          <form onSubmit={handleCheckTypedAnswer} className="my-2 space-y-3">
            <input
              type="text"
              disabled={isAnswerChecked}
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type answer from memory..."
              className="w-full rounded-xl bg-[#010736] px-4 py-3 text-xs sm:text-sm text-[#fcf1d0] border border-[#22396f] focus:border-[#fcf1d0] focus:outline-none"
            />
            {!isAnswerChecked && (
              <button
                type="submit"
                className="w-full rounded-xl bg-[#fcf1d0] hover:bg-white py-2.5 text-xs font-bold text-[#010736] transition cursor-pointer shadow-md active:scale-98"
              >
                Check Answer
              </button>
            )}
          </form>
        )}

        {/* C. Tactile Flashcard Flip Mode */}
        {effectiveMode === 'flashcard' && (
          <div 
            onClick={() => {
              if (!isFlipped && soundEnabled) playCardFlipSound();
              setIsFlipped(!isFlipped);
            }}
            className="perspective-1000 my-2 cursor-pointer group select-none"
          >
            <div className={`relative min-h-[140px] w-full rounded-2xl p-6 transition-all duration-300 border flex flex-col items-center justify-center text-center ${
              !isFlipped 
                ? 'border-dashed border-[#22396f] bg-[#010736] hover:border-[#fcf1d0]/60 hover:bg-[#010736]/80' 
                : 'border-[#22396f] bg-[#010736] shadow-lg animate-pop-in'
            }`}>
              {!isFlipped ? (
                <div className="flex flex-col items-center gap-2 text-[#fcf1d0]">
                  <RotateCw className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500 text-[#fcf1d0]" />
                  <span className="text-xs font-bold text-[#fcf1d0]">Tap to Flip</span>
                  <span className="text-[10px] text-[#fcf1d0]/50">Recall the answer, principle, or definition</span>
                </div>
              ) : (
                <div className="w-full text-left space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#fcf1d0]/70">
                      Answer & Explanation
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(currentCard.back);
                      }}
                      className="text-[#fcf1d0]/60 hover:text-[#fcf1d0] p-1 cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-[#fcf1d0] leading-relaxed">
                    {currentCard.back}
                  </p>
                  {currentCard.explanation && (
                    <p className="text-[11px] text-[#fcf1d0]/80 pt-1.5 border-t border-[#22396f] italic">
                      💡 {currentCard.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revealed Answer & Explanation Box for Quiz / Type modes */}
        {effectiveMode !== 'flashcard' && isAnswerChecked && (
          <div className="rounded-2xl bg-[#010736] p-4 border border-[#22396f] text-xs space-y-1.5 animate-pop-in">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-emerald-400 text-[10px]">
                Correct Answer
              </span>
              <button
                onClick={() => speakText(currentCard.back)}
                className="text-[#fcf1d0]/60 hover:text-[#fcf1d0] cursor-pointer"
                title="Pronounce answer"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="font-bold text-[#fcf1d0] text-sm leading-relaxed">
              {currentCard.back}
            </p>
            {currentCard.explanation && (
              <p className="text-[#fcf1d0]/80 text-[11px] pt-1 border-t border-[#22396f] leading-relaxed">
                💡 {currentCard.explanation}
              </p>
            )}
          </div>
        )}

        {/* 4. BOTTOM ACTION CONTROLS */}
        <div className="mt-5 pt-3 border-t border-[#22396f]">
          {effectiveMode === 'flashcard' && isFlipped ? (
            /* SM-2 Spaced Repetition Rating Buttons */
            <div>
              <p className="text-[10px] text-center font-semibold text-[#fcf1d0]/60 mb-2 uppercase tracking-wide">
                Recall rating (SM-2 Spacing)
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleRating(1)}
                  className="rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 py-2 text-[11px] font-bold text-rose-200 transition cursor-pointer text-center"
                >
                  Again<br /><span className="text-[9px] opacity-70">&lt;10m</span>
                </button>
                <button
                  onClick={() => handleRating(2)}
                  className="rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800 py-2 text-[11px] font-bold text-amber-200 transition cursor-pointer text-center"
                >
                  Hard<br /><span className="text-[9px] opacity-70">1d</span>
                </button>
                <button
                  onClick={() => handleRating(3)}
                  className="rounded-xl bg-[#22396f] hover:bg-[#22396f]/80 border border-[#fcf1d0]/40 py-2 text-[11px] font-bold text-[#fcf1d0] transition cursor-pointer text-center"
                >
                  Good<br /><span className="text-[9px] opacity-70">3d</span>
                </button>
                <button
                  onClick={() => handleRating(4)}
                  className="rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 py-2 text-[11px] font-bold text-emerald-200 transition cursor-pointer text-center"
                >
                  Easy<br /><span className="text-[9px] opacity-70">7d</span>
                </button>
              </div>
            </div>
          ) : isAnswerChecked ? (
            /* Next Question Button for Quiz and Type Modes */
            <button
              onClick={advanceCard}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fcf1d0] py-3 text-xs font-bold text-[#010736] shadow-md hover:bg-white active:scale-95 transition cursor-pointer"
            >
              <span>Next Card</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="text-center text-[11px] font-medium text-[#fcf1d0]/50">
              {effectiveMode === 'flashcard' ? 'Click card to reveal answer' : 'Select an option to check'}
            </div>
          )}
        </div>

      </div>

      {/* 5. AI TUTOR DRAWER / MODAL */}
      {isTutorOpen && (
        <div className="mt-4 rounded-3xl bg-[#0d1c42] p-5 border border-[#22396f] shadow-2xl animate-in slide-in-from-bottom-2 duration-200 text-[#fcf1d0] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#22396f]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#fcf1d0]" />
              <span className="text-xs font-bold text-[#fcf1d0] uppercase tracking-wide">
                Gemini AI Tutor
              </span>
            </div>
            <button
              onClick={() => setIsTutorOpen(false)}
              className="text-[#fcf1d0]/60 hover:text-[#fcf1d0] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleAskTutor('explain')}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                activeChip === 'explain' ? 'bg-[#fcf1d0] text-[#010736] font-bold' : 'bg-[#010736] text-[#fcf1d0] hover:bg-white/5 border border-[#22396f]'
              }`}
            >
              💡 Explain Concept
            </button>
            <button
              onClick={() => handleAskTutor('mnemonic')}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                activeChip === 'mnemonic' ? 'bg-[#fcf1d0] text-[#010736] font-bold' : 'bg-[#010736] text-[#fcf1d0] hover:bg-white/5 border border-[#22396f]'
              }`}
            >
              🧠 Give Mnemonic
            </button>
            <button
              onClick={() => handleAskTutor('example')}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                activeChip === 'example' ? 'bg-[#fcf1d0] text-[#010736] font-bold' : 'bg-[#010736] text-[#fcf1d0] hover:bg-white/5 border border-[#22396f]'
              }`}
            >
              💡 Real-World Example
            </button>
          </div>

          {/* Tutor Result Display */}
          <div className="rounded-2xl bg-[#010736] p-4 border border-[#22396f] text-xs text-[#fcf1d0]/90 leading-relaxed min-h-[80px]">
            {tutorLoading ? (
              <div className="flex items-center gap-2 text-[#fcf1d0] py-3">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Gemini is generating your explanation...</span>
              </div>
            ) : tutorResponse ? (
              <div className="whitespace-pre-line space-y-1">
                {tutorResponse}
              </div>
            ) : (
              <p className="text-[#fcf1d0]/50 italic">
                Select one of the chips above or ask a question below.
              </p>
            )}
          </div>

          {/* Custom Tutor Question Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (customTutorQuery.trim()) {
                handleAskTutor('custom', customTutorQuery.trim());
              }
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={customTutorQuery}
              onChange={(e) => setCustomTutorQuery(e.target.value)}
              placeholder="Ask the AI Tutor anything about this card..."
              className="flex-1 rounded-xl bg-[#010736] px-3 py-2 text-xs text-[#fcf1d0] placeholder-[#fcf1d0]/40 border border-[#22396f] focus:border-[#fcf1d0] focus:outline-none"
            />
            <button
              type="submit"
              disabled={tutorLoading || !customTutorQuery.trim()}
              className="rounded-xl bg-[#fcf1d0] hover:bg-white px-3.5 py-2 text-[#010736] font-bold text-xs disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
