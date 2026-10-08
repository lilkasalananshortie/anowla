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
  HelpCircle, 
  Send, 
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

  // Session metrics
  const [correctCount, setCorrectCount] = useState(0);
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
    }
    advanceCard();
  };

  const handleSelectOption = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
    setIsAnswerChecked(true);

    const match = option.trim().toLowerCase() === currentCard.back.trim().toLowerCase();
    setIsCorrect(match);
    if (match) setCorrectCount((prev) => prev + 1);
  };

  const handleCheckTypedAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswerChecked || !typedAnswer.trim()) return;
    setIsAnswerChecked(true);

    const match = typedAnswer.trim().toLowerCase() === currentCard.back.trim().toLowerCase();
    setIsCorrect(match);
    if (match) setCorrectCount((prev) => prev + 1);
  };

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
    const xp = cards.length * 20;
    onSessionComplete(xp, cards.length);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
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
    const xpGained = cards.length * 20;

    return (
      <div className="mx-auto max-w-lg rounded-3xl bg-[#222c3d] p-8 text-center text-white border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/20 shadow-md">
          <Trophy className="h-8 w-8" />
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">Session Completed!</h2>
        <p className="mt-1 text-xs text-white/60">
          Supercharged your memory and extended your spaced repetition retention.
        </p>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-black/20 p-4 border border-white/5">
          <div>
            <div className="text-xl font-bold text-amber-300">+{xpGained}</div>
            <div className="text-[11px] text-white/50">XP Earned</div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400">{accuracy}%</div>
            <div className="text-[11px] text-white/50">Accuracy</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-300">{cards.length}</div>
            <div className="text-[11px] text-white/50">Cards Mastered</div>
          </div>
        </div>

        <button
          onClick={onExit}
          className="mt-6 w-full rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 shadow-md hover:bg-white/90 transition cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="mx-auto max-w-2xl text-white font-poppins">
      
      {/* 1. TOP SESSION BAR & MODE SWITCHER */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/20 transition cursor-pointer backdrop-blur-md border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit</span>
          </button>

          <span className="text-xs font-bold text-amber-200 truncate max-w-[180px]">
            {deck.title}
          </span>
        </div>

        {/* Study Mode Selector Pills */}
        <div className="flex items-center gap-1 rounded-full bg-black/25 p-1 border border-white/10 text-[11px] font-semibold">
          <button
            onClick={() => setStudyMode('native')}
            className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
              studyMode === 'native' ? 'bg-white text-zinc-950 font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => setStudyMode('flashcard')}
            className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
              studyMode === 'flashcard' ? 'bg-white text-zinc-950 font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Flip
          </button>
          <button
            onClick={() => setStudyMode('multiple_choice')}
            className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
              studyMode === 'multiple_choice' ? 'bg-white text-zinc-950 font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setStudyMode('fill_blank')}
            className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
              studyMode === 'fill_blank' ? 'bg-white text-zinc-950 font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Type
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div 
            className="h-full bg-amber-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-white/60 whitespace-nowrap">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="relative min-h-[320px] rounded-3xl bg-[#222c3d] p-6 sm:p-8 shadow-2xl border border-white/10 flex flex-col justify-between">
        
        {/* Card Header Tag & TTS */}
        <div className="flex items-center justify-between text-xs">
          <span className="rounded-full bg-white/10 px-3 py-1 font-bold text-amber-200 border border-white/5">
            {effectiveMode === 'multiple_choice' 
              ? 'Multiple Choice Quiz' 
              : effectiveMode === 'fill_blank' 
              ? 'Typing Active Recall' 
              : 'Flashcard'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => speakText(currentCard.front)}
              className="p-1.5 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Pronounce question"
            >
              <Volume2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleAskTutor('explain')}
              className="flex items-center gap-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 text-[11px] font-bold text-amber-200 border border-amber-400/30 transition cursor-pointer"
              title="Ask AI Tutor for explanation"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="my-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">Question</span>
          <h2 className="mt-1 text-lg sm:text-xl font-bold text-white leading-snug">
            {currentCard.front}
          </h2>
        </div>

        {/* 3. INTERACTIVE STUDY MODE BODY */}

        {/* A. Multiple Choice Mode */}
        {effectiveMode === 'multiple_choice' && (
          <div className="grid grid-cols-1 gap-2.5 my-2">
            {options.map((option, idx) => {
              let btnStyle = "border-white/10 bg-white/5 hover:bg-white/10 text-white/90";

              if (isAnswerChecked) {
                if (option.trim().toLowerCase() === currentCard.back.trim().toLowerCase()) {
                  btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold border-2";
                } else if (selectedOption === option) {
                  btnStyle = "border-rose-500 bg-rose-500/20 text-rose-200 border-2";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerChecked}
                  onClick={() => handleSelectOption(option)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition cursor-pointer ${btnStyle}`}
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
              placeholder="Type your answer from memory..."
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-xs sm:text-sm text-white border border-white/10 focus:border-amber-400/50 focus:outline-none"
            />
            {!isAnswerChecked && (
              <button
                type="submit"
                className="w-full rounded-xl bg-white py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-white/90 cursor-pointer shadow-md"
              >
                Check Answer
              </button>
            )}
          </form>
        )}

        {/* C. Traditional Flashcard Flip Mode */}
        {effectiveMode === 'flashcard' && (
          <div className="my-2">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 p-8 text-center text-xs font-bold text-amber-200 transition hover:border-amber-400/40 hover:bg-white/5 cursor-pointer"
              >
                <RotateCw className="h-4 w-4" />
                <span>Tap or click to reveal answer</span>
              </button>
            ) : null}
          </div>
        )}

        {/* Revealed Answer & Explanation Box */}
        {(isFlipped || isAnswerChecked) && (
          <div className="rounded-2xl bg-black/25 p-4 border border-white/10 text-xs space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-emerald-300 text-[10px]">
                Correct Answer
              </span>
              <button
                onClick={() => speakText(currentCard.back)}
                className="text-white/50 hover:text-white cursor-pointer"
                title="Pronounce answer"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="font-bold text-white text-sm leading-relaxed">
              {currentCard.back}
            </p>
            {currentCard.explanation && (
              <p className="text-white/60 text-[11px] pt-1 border-t border-white/5 leading-relaxed">
                💡 {currentCard.explanation}
              </p>
            )}
          </div>
        )}

        {/* 4. BOTTOM ACTION CONTROLS */}
        <div className="mt-5 pt-3 border-t border-white/10">
          {effectiveMode === 'flashcard' && isFlipped ? (
            /* SM-2 Spaced Repetition Rating Buttons */
            <div>
              <p className="text-[10px] text-center font-semibold text-white/50 mb-2 uppercase tracking-wide">
                Rate your recall difficulty (SM-2 Interval)
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleRating(1)}
                  className="rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 py-2 text-[11px] font-bold text-rose-200 transition cursor-pointer text-center"
                >
                  Again<br /><span className="text-[9px] opacity-70">&lt;10m</span>
                </button>
                <button
                  onClick={() => handleRating(2)}
                  className="rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 py-2 text-[11px] font-bold text-amber-200 transition cursor-pointer text-center"
                >
                  Hard<br /><span className="text-[9px] opacity-70">1d</span>
                </button>
                <button
                  onClick={() => handleRating(3)}
                  className="rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 py-2 text-[11px] font-bold text-blue-200 transition cursor-pointer text-center"
                >
                  Good<br /><span className="text-[9px] opacity-70">3d</span>
                </button>
                <button
                  onClick={() => handleRating(4)}
                  className="rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 py-2 text-[11px] font-bold text-emerald-200 transition cursor-pointer text-center"
                >
                  Easy<br /><span className="text-[9px] opacity-70">7d</span>
                </button>
              </div>
            </div>
          ) : isAnswerChecked ? (
            /* Next Question Button for Quiz and Type Modes */
            <button
              onClick={advanceCard}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 shadow-md hover:bg-white/90 active:scale-95 transition cursor-pointer"
            >
              <span>Next Card</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="text-center text-[11px] font-medium text-white/40">
              {effectiveMode === 'flashcard' ? 'Click card to reveal answer' : 'Select an option to check'}
            </div>
          )}
        </div>

      </div>

      {/* 5. AI TUTOR DRAWER / MODAL */}
      {isTutorOpen && (
        <div className="mt-4 rounded-3xl bg-[#1c2432] p-5 border border-amber-400/30 shadow-2xl animate-in slide-in-from-bottom-2 duration-200 text-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                Gemini AI Tutor
              </span>
            </div>
            <button
              onClick={() => setIsTutorOpen(false)}
              className="text-white/50 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleAskTutor('explain')}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                activeChip === 'explain' ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              💡 Explain Concept
            </button>
            <button
              onClick={() => handleAskTutor('mnemonic')}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                activeChip === 'mnemonic' ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              🧠 Give Mnemonic
            </button>
            <button
              onClick={() => handleAskTutor('example')}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                activeChip === 'example' ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              🏥 Clinical Scenario
            </button>
          </div>

          {/* Tutor Result Display */}
          <div className="rounded-2xl bg-black/30 p-4 border border-white/5 text-xs text-white/90 leading-relaxed min-h-[80px]">
            {tutorLoading ? (
              <div className="flex items-center gap-2 text-amber-300 py-3">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Gemini is generating your explanation...</span>
              </div>
            ) : tutorResponse ? (
              <div className="whitespace-pre-line space-y-1">
                {tutorResponse}
              </div>
            ) : (
              <p className="text-white/50 italic">
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
              className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={tutorLoading || !customTutorQuery.trim()}
              className="rounded-xl bg-amber-400 hover:bg-amber-300 px-3.5 py-2 text-zinc-950 font-bold text-xs disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
