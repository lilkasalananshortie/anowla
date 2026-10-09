import { supabase, isSupabaseConfigured } from './supabase';
import { Deck, Card, UserStats, Folder } from '@/types';
import { INITIAL_DECKS, INITIAL_FOLDERS } from './mockData';

const LOCAL_STORAGE_DECKS_KEY = 'alwinyah_decks';
const LOCAL_STORAGE_STATS_KEY = 'alwinyah_stats';
const LOCAL_STORAGE_FOLDERS_KEY = 'alwinyah_folders';

/**
 * Fetch all decks for the user.
 * If user is logged in and Supabase is configured, fetches from Supabase.
 * Otherwise, falls back to localStorage (or INITIAL_DECKS).
 */
export async function fetchUserDecks(userId?: string | null): Promise<Deck[]> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      // 1. Fetch decks belonging to the user
      const { data: dbDecks, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (deckError) {
        console.warn('Error fetching decks from Supabase:', deckError.message);
        return getLocalDecks();
      }

      if (!dbDecks || dbDecks.length === 0) {
        // If the user has no decks yet in the cloud, check if they have local guest decks to migrate
        const localDecks = getLocalDecks();
        if (localDecks.length > 0 && localDecks !== INITIAL_DECKS) {
          // Sync existing guest decks to the new user's Supabase account
          await syncDecksToSupabase(localDecks, userId);
          return localDecks;
        }
        return [];
      }

      // 2. Fetch all cards for these decks
      const deckIds = dbDecks.map((d) => d.id);
      const { data: dbCards, error: cardError } = await supabase
        .from('cards')
        .select('*')
        .in('deck_id', deckIds);

      if (cardError) {
        console.warn('Error fetching cards from Supabase:', cardError.message);
      }

      const cardsByDeck: Record<string, Card[]> = {};
      (dbCards || []).forEach((c) => {
        if (!cardsByDeck[c.deck_id]) {
          cardsByDeck[c.deck_id] = [];
        }
        cardsByDeck[c.deck_id].push({
          id: c.id,
          deck_id: c.deck_id,
          card_type: c.card_type || 'flashcard',
          front: c.front,
          back: c.back,
          distractors: Array.isArray(c.distractors) ? c.distractors : [],
          explanation: c.explanation || '',
          hint: c.hint || '',
          ease_factor: c.ease_factor ?? 2.5,
          interval: c.interval ?? 0,
          repetitions: c.repetitions ?? 0,
          due_date: c.due_date || new Date().toISOString(),
          created_at: c.created_at || new Date().toISOString(),
        });
      });

      // Construct final Deck objects
      const now = new Date();
      const combinedDecks: Deck[] = dbDecks.map((d) => {
        const cards = cardsByDeck[d.id] || [];
        const dueCount = cards.filter((c) => new Date(c.due_date) <= now).length;
        return {
          id: d.id,
          title: d.title,
          description: d.description || '',
          category: d.category || 'General',
          cards_count: cards.length,
          due_count: dueCount,
          created_at: d.created_at,
          cards: cards,
        };
      });

      // Cache locally for offline availability
      saveLocalDecks(combinedDecks);
      return combinedDecks;
    } catch (err) {
      console.warn('Failed to load cloud decks, falling back to local:', err);
      return getLocalDecks();
    }
  }

  // Not logged in or Supabase unconfigured: use local storage
  return getLocalDecks();
}

/**
 * Save a newly created or imported deck.
 * If user is logged in, writes to Supabase 'decks' and 'cards' tables.
 * Always updates localStorage as cache.
 */
export async function saveUserDeck(deck: Deck, userId?: string | null): Promise<Deck> {
  // Update local storage first for snappy UI
  const localDecks = getLocalDecks();
  const existingIdx = localDecks.findIndex((d) => d.id === deck.id);
  let updatedLocal: Deck[];
  if (existingIdx >= 0) {
    updatedLocal = [...localDecks];
    updatedLocal[existingIdx] = deck;
  } else {
    updatedLocal = [deck, ...localDecks];
  }
  saveLocalDecks(updatedLocal);

  // If user is logged in, sync to Supabase
  if (isSupabaseConfigured && supabase && userId) {
    try {
      // 1. Upsert deck
      const { data: deckData, error: deckErr } = await supabase
        .from('decks')
        .upsert({
          id: deck.id,
          user_id: userId,
          title: deck.title,
          description: deck.description,
          category: deck.category || 'General',
          created_at: deck.created_at,
        })
        .select()
        .single();

      if (deckErr) {
        console.error('Failed to sync deck to Supabase:', deckErr.message);
        return deck;
      }

      // 2. Insert cards if any
      if (deck.cards && deck.cards.length > 0) {
        const cardsToUpsert = deck.cards.map((c) => ({
          id: c.id,
          deck_id: deck.id,
          card_type: c.card_type || 'flashcard',
          front: c.front,
          back: c.back,
          distractors: c.distractors || [],
          explanation: c.explanation || '',
          hint: c.hint || '',
          ease_factor: c.ease_factor || 2.5,
          interval: c.interval || 0,
          repetitions: c.repetitions || 0,
          due_date: c.due_date || new Date().toISOString(),
          created_at: c.created_at || new Date().toISOString(),
        }));

        const { error: cardsErr } = await supabase
          .from('cards')
          .upsert(cardsToUpsert);

        if (cardsErr) {
          console.error('Failed to sync cards to Supabase:', cardsErr.message);
        }
      }
    } catch (err) {
      console.error('Error during Supabase deck save:', err);
    }
  }

  return deck;
}

/**
 * Delete a deck (and cascade delete its cards).
 */
export async function deleteUserDeck(deckId: string, userId?: string | null): Promise<void> {
  // 1. Remove from local storage
  const localDecks = getLocalDecks().filter((d) => d.id !== deckId);
  saveLocalDecks(localDecks);

  // 2. Remove from Supabase if logged in
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to delete deck from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error deleting deck from Supabase:', err);
    }
  }
}

/**
 * Delete a single card from Supabase.
 */
export async function deleteCardFromDeck(cardId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('cards').delete().eq('id', cardId);
    } catch (e) {
      console.warn('Error deleting card from Supabase:', e);
    }
  }
}

/**
 * Sync guest decks to Supabase upon logging in.
 */
export async function syncDecksToSupabase(decks: Deck[], userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !userId) return;

  for (const deck of decks) {
    try {
      await supabase.from('decks').upsert({
        id: deck.id,
        user_id: userId,
        title: deck.title,
        description: deck.description,
        category: deck.category || 'General',
        created_at: deck.created_at,
      });

      if (deck.cards && deck.cards.length > 0) {
        const cardsToUpsert = deck.cards.map((c) => ({
          id: c.id,
          deck_id: deck.id,
          card_type: c.card_type || 'flashcard',
          front: c.front,
          back: c.back,
          distractors: c.distractors || [],
          explanation: c.explanation || '',
          hint: c.hint || '',
          ease_factor: c.ease_factor || 2.5,
          interval: c.interval || 0,
          repetitions: c.repetitions || 0,
          due_date: c.due_date || new Date().toISOString(),
          created_at: c.created_at || new Date().toISOString(),
        }));
        await supabase.from('cards').upsert(cardsToUpsert);
      }
    } catch (e) {
      console.warn('Could not sync deck:', deck.title, e);
    }
  }
}

/**
 * Sync or update user profile statistics.
 */
export async function syncUserProfileStats(stats: UserStats, userId?: string | null): Promise<void> {
  // Save locally
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(stats));
    } catch (e) {}
  }

  // Update in Supabase
  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        xp: stats.xp,
        streak: stats.streak,
        last_study_date: stats.last_study_date,
        daily_goal: stats.daily_goal,
      });
    } catch (err) {
      console.warn('Failed to sync profile stats to Supabase:', err);
    }
  }
}

const LOCAL_STORAGE_INITIALIZED_KEY = 'alwinyah_decks_initialized';

/**
 * Local storage helpers
 */
export function getLocalDecks(): Deck[] {
  if (typeof window === 'undefined') return INITIAL_DECKS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DECKS_KEY);
    const hasInitialized = localStorage.getItem(LOCAL_STORAGE_INITIALIZED_KEY);

    if (raw !== null) {
      return JSON.parse(raw);
    }

    if (hasInitialized) {
      // User has explicitly cleared or emptied their decks
      return [];
    }

    // First time visitor: seed default decks and mark initialized
    localStorage.setItem(LOCAL_STORAGE_INITIALIZED_KEY, 'true');
    localStorage.setItem(LOCAL_STORAGE_DECKS_KEY, JSON.stringify(INITIAL_DECKS));
    return INITIAL_DECKS;
  } catch (e) {
    console.warn('Error reading local decks', e);
  }
  return [];
}

export function saveLocalDecks(decks: Deck[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_INITIALIZED_KEY, 'true');
    localStorage.setItem(LOCAL_STORAGE_DECKS_KEY, JSON.stringify(decks));
  } catch (e) {
    console.warn('Error saving local decks', e);
  }
}

export function clearAllLocalDecks(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_INITIALIZED_KEY, 'true');
    localStorage.setItem(LOCAL_STORAGE_DECKS_KEY, JSON.stringify([]));
  } catch (e) {
    console.warn('Error clearing local decks', e);
  }
}

export function resetDefaultDecks(): Deck[] {
  if (typeof window === 'undefined') return INITIAL_DECKS;
  try {
    localStorage.setItem(LOCAL_STORAGE_INITIALIZED_KEY, 'true');
    localStorage.setItem(LOCAL_STORAGE_DECKS_KEY, JSON.stringify(INITIAL_DECKS));
  } catch (e) {}
  return INITIAL_DECKS;
}

export function getLocalFolders(): Folder[] {
  if (typeof window === 'undefined') return INITIAL_FOLDERS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FOLDERS_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    localStorage.setItem(LOCAL_STORAGE_FOLDERS_KEY, JSON.stringify(INITIAL_FOLDERS));
  } catch (e) {
    console.warn('Error reading local folders', e);
  }
  return INITIAL_FOLDERS;
}

export function saveLocalFolders(folders: Folder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_FOLDERS_KEY, JSON.stringify(folders));
  } catch (e) {
    console.warn('Error saving local folders', e);
  }
}

