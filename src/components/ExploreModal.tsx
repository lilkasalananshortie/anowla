'use client';

import React, { useState } from 'react';
import { Deck, Card } from '@/types';
import { 
  X, 
  Compass, 
  Search, 
  Download, 
  Layers, 
  Sparkles, 
  Check, 
  BookOpen, 
  Heart,
  Users,
  ChevronRight
} from 'lucide-react';

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloneDeck: (deck: Deck) => void;
}

interface CommunityDeck extends Deck {
  author: string;
  authorBadge: string;
  downloadsCount: number;
}

const COMMUNITY_DECKS: CommunityDeck[] = [
  {
    id: 'comm_1',
    title: 'USMLE Step 1: High-Yield Autonomic Pharmacology',
    description: 'Adrenergic and cholinergic receptor physiology, agonists, antagonists, and toxicities.',
    category: 'Pharmacology',
    author: 'Dr. Marcus Vance',
    authorBadge: 'MD Resident',
    downloadsCount: 1420,
    cards_count: 5,
    due_count: 5,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c1_1',
        deck_id: 'comm_1',
        card_type: 'flashcard',
        front: 'What receptor mediates bronchial smooth muscle relaxation?',
        back: 'Beta-2 Adrenergic Receptor (Gs coupled, increases intracellular cAMP).',
        explanation: 'Stimulation by agonists like Albuterol causes bronchodilation.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c1_2',
        deck_id: 'comm_1',
        card_type: 'multiple_choice',
        front: 'Which drug is the first-line treatment for acute anaphylactic shock?',
        back: 'Epinephrine (IM 1:1000)',
        distractors: ['Diphenhydramine', 'Albuterol nebulizer', 'Methylprednisolone'],
        explanation: 'Epinephrine acts on alpha-1 (vasoconstriction), beta-1 (inotropic), and beta-2 (bronchodilation).',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c1_3',
        deck_id: 'comm_1',
        card_type: 'fill_blank',
        front: 'Atropine toxicity presents with the classic mnemonic: "Hot as a hare, blind as a bat, dry as a bone, red as a beet, mad as a ________."',
        back: 'hatter',
        explanation: 'Classic presentation of antimuscarinic / anticholinergic toxidrome.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c1_4',
        deck_id: 'comm_1',
        card_type: 'flashcard',
        front: 'What is the primary mechanism of action of Phentolamine?',
        back: 'Non-selective Alpha-1 and Alpha-2 adrenergic receptor blocker.',
        explanation: 'Used to treat pheochromocytoma-induced hypertensive crises and extravasation of vasopressors.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c1_5',
        deck_id: 'comm_1',
        card_type: 'multiple_choice',
        front: 'Which beta-blocker is cardioselective (Beta-1 selective)?',
        back: 'Metoprolol',
        distractors: ['Propranolol', 'Timolol', 'Nadolol'],
        explanation: 'A-M beta blockers (Atenolol, Betaxolol, Bisoprolol, Metoprolol) are Beta-1 selective.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'comm_2',
    title: 'Emergency Medicine: ACLS Cardiac Arrest & Arrhythmias',
    description: 'Shockable vs non-shockable rhythms, reversible causes (Hs and Ts), and drug dosages.',
    category: 'Emergency',
    author: 'Sarah Chen, RN',
    authorBadge: 'Trauma ICU',
    downloadsCount: 980,
    cards_count: 4,
    due_count: 4,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c2_1',
        deck_id: 'comm_2',
        card_type: 'multiple_choice',
        front: 'Which rhythms in cardiac arrest are shockable with a defibrillator?',
        back: 'Ventricular Fibrillation (VF) and Pulseless Ventricular Tachycardia (pVT)',
        distractors: ['PEA and Asystole', 'Asystole only', 'Sinus Bradycardia and Junctional Rhythm'],
        explanation: 'Only disorganized ventricular tachyarrhythmias (VF/pVT) respond to electrical defibrillation.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c2_2',
        deck_id: 'comm_2',
        card_type: 'flashcard',
        front: 'What is the standard first dose of Amiodarone in refractory shockable cardiac arrest?',
        back: '300 mg IV/IO push (followed by 150 mg second dose).',
        explanation: 'Given after the 3rd defibrillation attempt in VF/pVT.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c2_3',
        deck_id: 'comm_2',
        card_type: 'fill_blank',
        front: 'The reversible causes of PEA cardiac arrest are grouped into the 5 Hs and 5 ________.',
        back: 'Ts',
        explanation: 'Tension pneumothorax, Tamponade, Toxins, Thrombosis pulmonary, Thrombosis coronary.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c2_4',
        deck_id: 'comm_2',
        card_type: 'flashcard',
        front: 'What is the recommended compression depth for adult CPR per AHA guidelines?',
        back: 'At least 2 inches (5 cm) but not more than 2.4 inches (6 cm).',
        explanation: 'Rate should be 100 to 120 compressions per minute with complete chest recoil.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'comm_3',
    title: 'Data Structures & Algorithms: LeetCode Patterns',
    description: 'Sliding window, two pointers, BFS/DFS tree traversals, and dynamic programming.',
    category: 'Computer Science',
    author: 'Alex Rivera',
    authorBadge: 'Senior SWE',
    downloadsCount: 2310,
    cards_count: 4,
    due_count: 4,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c3_1',
        deck_id: 'comm_3',
        card_type: 'flashcard',
        front: 'What is the time complexity of searching in a balanced Binary Search Tree (AVL / Red-Black)?',
        back: 'O(log n) time complexity, with O(1) space auxiliary.',
        explanation: 'Height of a balanced BST with n elements is guaranteed to be log2(n).',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c3_2',
        deck_id: 'comm_3',
        card_type: 'multiple_choice',
        front: 'Which algorithmic pattern is best suited for finding the shortest path in an unweighted graph?',
        back: 'Breadth-First Search (BFS)',
        distractors: ['Depth-First Search (DFS)', 'Dijkstra Algorithm', 'Greedy Choice'],
        explanation: 'BFS explores nodes layer by layer, guaranteeing shortest path in unweighted graphs.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c3_3',
        deck_id: 'comm_3',
        card_type: 'fill_blank',
        front: 'Dijkstra algorithm uses a priority queue / ________ to achieve O((V + E) log V) time.',
        back: 'min-heap',
        explanation: 'Min-heap efficiently extracts the vertex with minimum distance in O(log V).',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c3_4',
        deck_id: 'comm_3',
        card_type: 'flashcard',
        front: 'What data structure enables O(1) average lookup, insertion, and deletion by key?',
        back: 'Hash Table / Hash Map (using hash function and collision resolution).',
        explanation: 'Worst-case is O(n) under high collision frequency without re-hashing.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'comm_4',
    title: 'Neuroanatomy: Cranial Nerves & Brainstem Reflexes',
    description: 'All 12 cranial nerves, functional modalities, exit foramina, and clinical lesion deficits.',
    category: 'Neuroscience',
    author: 'Emily Watson',
    authorBadge: 'Neurology MS3',
    downloadsCount: 1670,
    cards_count: 4,
    due_count: 4,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c4_1',
        deck_id: 'comm_4',
        card_type: 'multiple_choice',
        front: 'Which cranial nerve carries sensory afferents for the corneal blink reflex?',
        back: 'CN V1 (Ophthalmic division of Trigeminal Nerve)',
        distractors: ['CN VII (Facial Nerve)', 'CN II (Optic Nerve)', 'CN III (Oculomotor Nerve)'],
        explanation: 'CN V1 is the sensory limb; CN VII (Facial) mediates the motor efferent blink.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c4_2',
        deck_id: 'comm_4',
        card_type: 'flashcard',
        front: 'A patient has deviation of the uvula to the right. Which cranial nerve is impaired?',
        back: 'Left CN X (Left Vagus Nerve).',
        explanation: 'The uvula always deviates away from the side of the vagus nerve lesion.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c4_3',
        deck_id: 'comm_4',
        card_type: 'fill_blank',
        front: 'The Trochlear nerve (CN IV) innervates the ________ oblique extraocular muscle.',
        back: 'superior',
        explanation: 'Mnemonic: LR6 SO4 R3 (Lateral Rectus: VI, Superior Oblique: IV, Rest: III).',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c4_4',
        deck_id: 'comm_4',
        card_type: 'flashcard',
        front: 'Through which skull base opening does the Hypoglossal Nerve (CN XII) exit?',
        back: 'Hypoglossal Canal in the occipital bone.',
        explanation: 'Controls all intrinsic and extrinsic tongue muscles except palatoglossus.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export default function ExploreModal({
  isOpen,
  onClose,
  onCloneDeck,
}: ExploreModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [clonedIds, setClonedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const categories = ['All', 'Pharmacology', 'Emergency', 'Computer Science', 'Neuroscience'];

  const filtered = COMMUNITY_DECKS.filter((deck) => {
    const matchesSearch =
      deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || deck.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleClone = (deck: CommunityDeck) => {
    // Generate fresh IDs for cloned cards so they are independent in user's library
    const clonedDeck: Deck = {
      ...deck,
      id: crypto.randomUUID ? crypto.randomUUID() : `cloned_${Date.now()}`,
      created_at: new Date().toISOString(),
      cards: (deck.cards || []).map((c) => ({
        ...c,
        id: crypto.randomUUID ? crypto.randomUUID() : `card_clone_${Date.now()}_${Math.random()}`,
        deck_id: '',
        due_date: new Date().toISOString(),
        repetitions: 0,
        interval: 0,
        ease_factor: 2.5,
      })),
    };

    onCloneDeck(clonedDeck);
    setClonedIds((prev) => [...prev, deck.id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#18202d] border border-white/10 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1c2534]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Community Deck Library
                </h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                  Verified Curated
                </span>
              </div>
              <p className="text-xs text-white/60">
                Explore pre-built high-yield decks and clone them to your personal study hub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Categories Filter */}
        <div className="p-4 px-6 border-b border-white/10 bg-[#192230] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search community decks..."
              className="w-full rounded-full bg-white/5 py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-zinc-950 font-bold'
                    : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Decks Grid Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((deck) => {
            const isCloned = clonedIds.includes(deck.id);

            return (
              <div
                key={deck.id}
                className="rounded-3xl bg-[#222c3d] p-5 border border-white/10 flex flex-col justify-between hover:border-white/20 transition space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-200">
                      {deck.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-white/50">
                      <Users className="h-3.5 w-3.5 text-white/40" />
                      {deck.downloadsCount} clones
                    </span>
                  </div>

                  <h4 className="mt-2 text-base font-bold text-white leading-snug">
                    {deck.title}
                  </h4>
                  <p className="mt-1 text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-white/90">{deck.author}</p>
                    <p className="text-[10px] text-amber-300/80 font-semibold">{deck.authorBadge}</p>
                  </div>

                  <button
                    onClick={() => handleClone(deck)}
                    disabled={isCloned}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer shadow-md ${
                      isCloned
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white text-zinc-950 hover:bg-white/90 active:scale-95'
                    }`}
                  >
                    {isCloned ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Cloned to Library</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Clone Deck ({deck.cards_count})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
