'use client';

import React, { useState } from 'react';
import { Card, Deck, ReviewRating } from '@/types';
import { calculateNextReview } from '@/lib/srs';
import { 
  ArrowLeft, 
  RotateCw, 
  Check, 
  X, 
  Trophy, 
  ChevronRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudySessionProps {
  deck: Deck;
  onExit: () => void;
  onSessionComplete: (xpGained: number, cardsStudied: number) => void;
}

export default function StudySession({ deck, onExit, onSessionComplete }: StudySessionProps) {
  const cards: Card[] = deck.cards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Performance tracking
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = cards[currentIndex];

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">This deck has no cards to study yet!</p>
        <button
          onClick={onExit}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer"
        >
          Return to Decks
        </button>
      </div>
    );
  }

  // Shuffle multiple choice options once per card
  const options = React.useMemo(() => {
    if (!currentCard || currentCard.card_type !== 'multiple_choice') return [];
    const all = [currentCard.back, ...(currentCard.distractors || [])];
    return all.sort(() => Math.random() - 0.5);
  }, [currentIndex, currentCard]);

  const handleRating = (rating: ReviewRating) => {
    // SRS update using SM-2 algorithm
    const updated = calculateNextReview(currentCard, rating);
    Object.assign(currentCard, updated);

    if (rating >= 3) {
      setCorrectCount(prev => prev + 1);
    }
    advanceCard();
  };

  const handleSelectOption = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
    setIsAnswerChecked(true);

    const match = option.trim().toLowerCase() === currentCard.back.trim().toLowerCase();
    setIsCorrect(match);
    if (match) setCorrectCount(prev => prev + 1);
  };

  const handleCheckTypedAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswerChecked || !typedAnswer.trim()) return;
    setIsAnswerChecked(true);

    const match = typedAnswer.trim().toLowerCase() === currentCard.back.trim().toLowerCase();
    setIsCorrect(match);
    if (match) setCorrectCount(prev => prev + 1);
  };

  const advanceCard = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    setTypedAnswer('');
    setIsAnswerChecked(false);
    setIsCorrect(null);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(prev => prev + 1);
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
    } catch (e) {
      // Ignore in non-browser environment
    }
  };

  if (isFinished) {
    const accuracy = Math.round((correctCount / cards.length) * 100);
    const xpGained = cards.length * 20;

    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <Trophy className="h-8 w-8" />
        </div>

        <h2 className="mt-4 text-2xl font-black text-zinc-900 dark:text-white">Session Completed!</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Great job continuing your learning streak.
        </p>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
          <div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">+{xpGained}</div>
            <div className="text-xs text-zinc-500">XP Gained</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
            <div className="text-xs text-zinc-500">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{cards.length}</div>
            <div className="text-xs text-zinc-500">Cards</div>
          </div>
        </div>

        <button
          onClick={onExit}
          className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Top Session Bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/25 transition cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Session</span>
        </button>

        {/* Progress Tracker */}
        <div className="flex flex-1 items-center gap-3 px-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div 
              className="h-full bg-teal-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-white/80 whitespace-nowrap">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="relative min-h-[340px] rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900">
        
        {/* Card Type Tag */}
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span className="uppercase tracking-wider">
            {currentCard.card_type === 'multiple_choice' 
              ? 'Multiple Choice' 
              : currentCard.card_type === 'fill_blank' 
              ? 'Fill in the Blank' 
              : 'Flashcard'}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="my-6">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
            {currentCard.front}
          </h2>
        </div>

        {/* 1. Multiple Choice Mode */}
        {currentCard.card_type === 'multiple_choice' && (
          <div className="mt-6 grid grid-cols-1 gap-3">
            {options.map((option, idx) => {
              let btnStyle = "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800";

              if (isAnswerChecked) {
                if (option.trim().toLowerCase() === currentCard.back.trim().toLowerCase()) {
                  btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border-2";
                } else if (selectedOption === option) {
                  btnStyle = "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 border-2";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerChecked}
                  onClick={() => handleSelectOption(option)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm font-medium transition cursor-pointer ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswerChecked && option.trim().toLowerCase() === currentCard.back.trim().toLowerCase() && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                  {isAnswerChecked && selectedOption === option && option.trim().toLowerCase() !== currentCard.back.trim().toLowerCase() && (
                    <X className="h-4 w-4 text-rose-600" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Fill in the Blank Mode */}
        {currentCard.card_type === 'fill_blank' && (
          <form onSubmit={handleCheckTypedAnswer} className="mt-6">
            <input
              type="text"
              disabled={isAnswerChecked}
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type the answer here..."
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {!isAnswerChecked && (
              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
              >
                Check Answer
              </button>
            )}
            {isAnswerChecked && (
              <div className="mt-4 rounded-xl bg-zinc-100 p-3 text-sm dark:bg-zinc-800">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Answer: </span>
                <span className="text-indigo-600 font-bold dark:text-indigo-400">{currentCard.back}</span>
              </div>
            )}
          </form>
        )}

        {/* 3. Classic Flashcard Mode */}
        {currentCard.card_type === 'flashcard' && (
          <div className="mt-4">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm font-semibold text-indigo-600 transition hover:border-indigo-500 hover:bg-indigo-50/30 dark:border-zinc-700 dark:text-indigo-400 cursor-pointer"
              >
                <RotateCw className="h-4 w-4" />
                <span>Tap or click to reveal answer</span>
              </button>
            ) : (
              <div className="rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-800/60">
                <div className="text-xs font-bold uppercase text-zinc-400">Answer</div>
                <div className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  {currentCard.back}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="mt-6 flex items-center justify-between">
        {currentCard.card_type === 'flashcard' && isFlipped ? (
          /* SM-2 Spaced Repetition Rating Buttons */
          <div className="grid w-full grid-cols-4 gap-2">
            <button
              onClick={() => handleRating(1)}
              className="rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
            >
              Again (<span className="text-[10px]">1d</span>)
            </button>
            <button
              onClick={() => handleRating(2)}
              className="rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 cursor-pointer"
            >
              Hard (<span className="text-[10px]">2d</span>)
            </button>
            <button
              onClick={() => handleRating(3)}
              className="rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 cursor-pointer"
            >
              Good (<span className="text-[10px]">4d</span>)
            </button>
            <button
              onClick={() => handleRating(4)}
              className="rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 cursor-pointer"
            >
              Easy (<span className="text-[10px]">7d</span>)
            </button>
          </div>
        ) : isAnswerChecked ? (
          /* Next Question Button */
          <button
            onClick={advanceCard}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
          >
            <span>Continue</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
