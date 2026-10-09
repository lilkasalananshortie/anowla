export type CardType = 'flashcard' | 'multiple_choice' | 'fill_blank';

export type ReviewRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface Card {
  id: string;
  deck_id: string;
  card_type: CardType;
  front: string; // Question or prompt
  back: string; // Correct answer
  distractors?: string[]; // Incorrect options for multiple choice
  explanation?: string; // High-yield rationale
  hint?: string;
  // Spaced Repetition (SRS) data
  ease_factor: number; // Default 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of consecutive correct reviews
  due_date: string; // ISO date string
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category?: string;
  folder_id?: string;
  cards_count: number;
  due_count: number;
  created_at: string;
  cards?: Card[];
}

export interface ClinicalNote {
  id: string;
  pageNumber?: number;
  text: string;
  color?: string;
  created_at: string;
}

export interface DocumentHighlight {
  id: string;
  pageNumber: number;
  text: string;
  color: 'yellow' | 'green' | 'rose' | 'blue';
  created_at: string;
}

export interface DocumentPage {
  pageNumber: number;
  text: string;
}

export interface StudyDocument {
  id: string;
  title: string;
  content: string;
  folder_id?: string;
  file_name?: string;
  total_pages?: number;
  pages?: DocumentPage[];
  highlights?: DocumentHighlight[];
  notes?: ClinicalNote[];
  created_at: string;
  updated_at?: string;
}

export interface UserStats {
  streak: number;
  last_study_date: string | null;
  xp: number;
  cards_studied_today: number;
  daily_goal: number;
}
