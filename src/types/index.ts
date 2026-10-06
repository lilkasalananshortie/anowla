export type CardType = 'flashcard' | 'multiple_choice' | 'fill_blank';

export type ReviewRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface Card {
  id: string;
  deck_id: string;
  card_type: CardType;
  front: string; // Question or prompt
  back: string; // Correct answer
  distractors?: string[]; // Incorrect options for multiple choice
  explanation?: string; // AI explanation
  hint?: string;
  // Spaced Repetition (SRS) data
  ease_factor: number; // Default 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of consecutive correct reviews
  due_date: string; // ISO date string
  created_at: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category?: string;
  cards_count: number;
  due_count: number;
  created_at: string;
  cards?: Card[];
}

export interface UserStats {
  streak: number;
  last_study_date: string | null;
  xp: number;
  cards_studied_today: number;
  daily_goal: number;
}
