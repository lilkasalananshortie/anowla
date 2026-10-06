-- ==============================================================
-- Alwinyah Database Schema for Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================

-- 1. Create Profiles Table (syncs with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_study_date DATE,
  daily_goal INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Decks Table
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Cards Table with Spaced Repetition (SRS) fields
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
  card_type TEXT CHECK (card_type IN ('flashcard', 'multiple_choice', 'fill_blank')) NOT NULL DEFAULT 'flashcard',
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  distractors JSONB DEFAULT '[]'::jsonb,
  explanation TEXT,
  hint TEXT,
  -- SRS (SM-2 Algorithm)
  ease_factor FLOAT DEFAULT 2.5 NOT NULL,
  interval INTEGER DEFAULT 0 NOT NULL,
  repetitions INTEGER DEFAULT 0 NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Review History / Analytics Table
CREATE TABLE IF NOT EXISTS public.review_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 4) NOT NULL, -- 1: Again, 2: Hard, 3: Good, 4: Easy
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;

-- Simple policies (Users can read/write their own data)
CREATE POLICY "Public decks are viewable by everyone" ON public.decks
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own decks" ON public.decks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Cards viewable if deck is viewable" ON public.cards
  FOR SELECT USING (true);

CREATE POLICY "Users can manage cards in their decks" ON public.cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decks 
      WHERE public.decks.id = public.cards.deck_id 
      AND public.decks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own profiles" ON public.profiles
  FOR ALL USING (auth.uid() = id);
