import { Card, ReviewRating } from '@/types';

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * Free, client-and-server compatible algorithm for memory retention.
 */
export function calculateNextReview(card: Card, rating: ReviewRating): {
  interval: number;
  repetitions: number;
  ease_factor: number;
  due_date: string;
} {
  let { interval, repetitions, ease_factor } = card;

  // Rating 1: Again (Failed)
  // Rating 2: Hard
  // Rating 3: Good
  // Rating 4: Easy
  if (rating < 3) {
    // Card failed or too difficult -> reset repetitions
    repetitions = 0;
    interval = 1;
  } else {
    // Card recalled successfully
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    repetitions += 1;
  }

  // Adjust Ease Factor (minimum 1.3)
  // Formula: EF' = EF + (0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02))
  const delta = 0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02);
  ease_factor = Math.max(1.3, Number((ease_factor + delta).toFixed(2)));

  // Calculate next due date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    interval,
    repetitions,
    ease_factor,
    due_date: nextDate.toISOString(),
  };
}

/**
 * Checks if a card is currently due for study
 */
export function isCardDue(card: Card): boolean {
  if (!card.due_date) return true;
  return new Date(card.due_date) <= new Date();
}
