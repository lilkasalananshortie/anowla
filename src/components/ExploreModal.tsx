'use client';

import React, { useState } from 'react';
import { Deck } from '@/types';
import { 
  X, 
  Compass, 
  Search, 
  Download, 
  Layers, 
  Check, 
  BookOpen
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
    title: 'Algorithms & Data Structures: Graphs & Trees',
    description: 'Graph representations, BFS/DFS traversals, Dijkstra shortest path, and asymptotic Big-O runtime.',
    category: 'Computer Science',
    author: 'Elena Rostova',
    authorBadge: 'CS Faculty Fellow',
    downloadsCount: 3420,
    cards_count: 4,
    due_count: 4,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c1_1',
        deck_id: 'comm_1',
        card_type: 'flashcard',
        front: 'What is the time complexity of Dijkstra algorithm using a Min-Heap / Binary Priority Queue?',
        back: 'O((V + E) log V), where V is the number of vertices and E is the number of edges.',
        explanation: 'Each vertex is extracted from the heap once in O(V log V), and every edge relaxation updates the heap in O(E log V).',
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
        front: 'Which traversal method visits tree nodes level-by-level using a First-In-First-Out (FIFO) queue?',
        back: 'Breadth-First Search (BFS)',
        distractors: ['Depth-First Search (DFS)', 'Post-Order Traversal', 'In-Order Traversal'],
        explanation: 'BFS explores neighbor vertices level by level using a FIFO queue, unlike DFS which relies on recursion or a LIFO stack.',
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
        front: 'A Directed Acyclic Graph (DAG) can have its vertices ordered linearly such that for every directed edge u -> v, u comes before v. This ordering is called a ________ sort.',
        back: 'topological',
        explanation: 'Topological sorting is only possible on DAGs and is widely used for task scheduling and dependency resolution.',
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
        front: 'What property differentiates an AVL Tree from an arbitrary Binary Search Tree?',
        back: 'Strict self-balancing: the heights of the two child subtrees of any node differ by at most one.',
        explanation: 'This balance factor guarantee ensures O(log n) worst-case time for search, insertion, and deletion.',
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
    title: 'Cognitive Science: Memory Systems & Retrieval',
    description: 'Working memory architecture, Ebbinghaus forgetting dynamics, dual-coding theory, and consolidation.',
    category: 'Cognitive Science',
    author: 'Julian Thorne',
    authorBadge: 'Cognitive Researcher',
    downloadsCount: 2890,
    cards_count: 4,
    due_count: 4,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c2_1',
        deck_id: 'comm_2',
        card_type: 'multiple_choice',
        front: 'What cognitive phenomenon describes superior long-term retention achieved by testing memory rather than passive re-reading?',
        back: 'The Testing Effect (Retrieval Practice)',
        distractors: ['The Framing Effect', 'The Primacy Bias', 'The Zeigarnik Effect'],
        explanation: 'Active recall strengthens neural retrieval pathways and reconstructs memory traces, significantly outperforming passive review.',
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
        front: 'What are the three core slave components of Baddeley and Hitch multicomponent working memory model?',
        back: 'The Phonological Loop, the Visuospatial Sketchpad, and the Episodic Buffer (coordinated by the Central Executive).',
        explanation: 'The central executive manages attentional focus while the slave systems temporarily store modality-specific representations.',
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
        front: 'Hermann Ebbinghaus discovered that memory decay follows an exponential curve, which can be flattened through ________ review intervals.',
        back: 'spaced',
        explanation: 'Expanding spaced intervals intercept forgetting just as memory accessibility diminishes, maximizing consolidation.',
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
        front: 'What is Long-Term Potentiation (LTP)?',
        back: 'A persistent strengthening of synapses based on recent patterns of activity, producing a long-lasting increase in signal transmission.',
        explanation: 'LTP is widely considered one of the primary cellular mechanisms underlying learning and memory formation in the hippocampus.',
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
    title: 'Constitutional Law & Legal Jurisprudence',
    description: 'Judicial review standards, due process, equal protection tiers of scrutiny, and statutory interpretation.',
    category: 'Law & Governance',
    author: 'Clara Sterling',
    authorBadge: 'JD Scholar',
    downloadsCount: 1980,
    cards_count: 3,
    due_count: 3,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c3_1',
        deck_id: 'comm_3',
        card_type: 'flashcard',
        front: 'What landmark decision established the power of judicial review in United States constitutional jurisprudence?',
        back: 'Marbury v. Madison (1803)',
        explanation: 'Chief Justice John Marshall declared that it is emphatically the province and duty of the judicial department to say what the law is.',
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
        front: 'Under equal protection analysis, what standard of review applies to government classifications based on suspect classifications such as race or national origin?',
        back: 'Strict Scrutiny',
        distractors: ['Rational Basis Review', 'Intermediate Scrutiny', 'Arbitrary and Capricious Standard'],
        explanation: 'Strict scrutiny requires the government to prove the law is narrowly tailored to achieve a compelling governmental interest.',
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
        front: 'The doctrine that courts should follow established precedent rather than overturn settled judicial decisions is known as stare ________.',
        back: 'decisis',
        explanation: 'Stare decisis promotes legal stability, predictability, and judicial integrity.',
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
    title: 'Molecular Biology & Gene Expression',
    description: 'DNA replication mechanics, transcription initiation, mRNA splicing, epigenetic histone marks, and CRISPR.',
    category: 'Biological Sciences',
    author: 'Dr. Michael Chen',
    authorBadge: 'Postdoctoral Fellow',
    downloadsCount: 2450,
    cards_count: 3,
    due_count: 3,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c4_1',
        deck_id: 'comm_4',
        card_type: 'flashcard',
        front: 'What enzyme synthesizes the short RNA primers required for DNA polymerase during lagging strand synthesis?',
        back: 'DNA Primase (part of the primosome complex).',
        explanation: 'DNA polymerase cannot initiate de novo synthesis; it requires a free 3-prime OH group provided by the RNA primer.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c4_2',
        deck_id: 'comm_4',
        card_type: 'multiple_choice',
        front: 'Which epigenetic modification on histone tails is most universally correlated with open, transcriptionally active chromatin (euchromatin)?',
        back: 'Histone Acetylation (e.g. via Histone Acetyltransferases / HATs)',
        distractors: ['DNA Hypermethylation', 'Histone Deacetylation', 'Ubiquitination of H2A'],
        explanation: 'Acetylation neutralizes the positive charge on lysine residues, weakening electrostatic attraction to negatively charged DNA.',
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
        front: 'In CRISPR-Cas9 genome editing, the Cas9 endonuclease introduces a double-strand break adjacent to a short sequence known as the ________ (protospacer adjacent motif).',
        back: 'PAM',
        explanation: 'For SpCas9, the canonical PAM sequence is 5-prime NGG 3-prime.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'comm_5',
    title: 'Principles of Microeconomics & Market Theory',
    description: 'Price elasticity, consumer surplus, deadweight loss, monopoly rent-seeking, and game theory equilibria.',
    category: 'Economics',
    author: 'Sarah Al-Mansoor',
    authorBadge: 'Econ Lecturer',
    downloadsCount: 1720,
    cards_count: 3,
    due_count: 3,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c5_1',
        deck_id: 'comm_5',
        card_type: 'flashcard',
        front: 'What defines a Nash Equilibrium in non-cooperative game theory?',
        back: 'A profile of strategies where no player has an incentive to unilaterally deviate, given the strategies chosen by all other players.',
        explanation: 'At Nash Equilibrium, each player strategy is an optimal response to the opponents chosen strategies.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c5_2',
        deck_id: 'comm_5',
        card_type: 'multiple_choice',
        front: 'When demand for a good is price-inelastic (|Ed| < 1), what happens to total revenue when the price rises?',
        back: 'Total revenue increases',
        distractors: ['Total revenue decreases', 'Total revenue remains unchanged', 'Total revenue drops to zero'],
        explanation: 'The percentage decrease in quantity demanded is smaller than the percentage increase in price, resulting in net revenue growth.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c5_3',
        deck_id: 'comm_5',
        card_type: 'fill_blank',
        front: 'The loss of total economic welfare (consumer plus producer surplus) resulting from market distortions such as taxes or monopoly power is termed ________ loss.',
        back: 'deadweight',
        explanation: 'Deadweight loss represents mutually beneficial transactions that fail to occur due to distorted price signals.',
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

  const categories = [
    'All',
    'Computer Science',
    'Cognitive Science',
    'Law & Governance',
    'Biological Sciences',
    'Economics',
  ];

  const filtered = COMMUNITY_DECKS.filter((deck) => {
    const matchesSearch =
      deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || deck.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleClone = (deck: CommunityDeck) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010736]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0d1c42] border border-[#22396f] shadow-2xl text-[#fcf1d0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#22396f] bg-[#010736]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d1c42] text-[#fcf1d0] border border-[#22396f]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-[#fcf1d0]">
                  Curated Decks
                </h3>
                <span className="rounded-full bg-[#0d1c42] px-2 py-0.5 text-[10px] font-bold text-[#fcf1d0] border border-[#22396f]">
                  Open Library
                </span>
              </div>
              <p className="text-xs text-[#fcf1d0]/60">
                Clone structured decks directly into your study collection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d1c42] text-[#fcf1d0]/70 hover:text-[#fcf1d0] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar: Search + Category Filters */}
        <div className="p-4 px-6 border-b border-[#22396f] bg-[#010736]/60 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#fcf1d0]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search curated decks by title, topic, or contributor..."
              className="w-full rounded-full bg-[#010736] py-2 pl-10 pr-4 text-xs sm:text-sm text-[#fcf1d0] placeholder-[#fcf1d0]/40 border border-[#22396f] focus:border-[#fcf1d0] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#fcf1d0] text-[#010736] font-bold'
                    : 'bg-[#010736] text-[#fcf1d0]/70 border border-[#22396f] hover:border-[#fcf1d0]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Deck Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((deck) => {
            const isCloned = clonedIds.includes(deck.id);

            return (
              <div
                key={deck.id}
                className="rounded-2xl bg-[#010736] p-5 border border-[#22396f] hover:border-[#fcf1d0]/40 transition shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-[#0d1c42] px-2.5 py-0.5 text-[10px] font-bold text-[#fcf1d0] border border-[#22396f]">
                      {deck.category}
                    </span>
                    <span className="text-[11px] text-[#fcf1d0]/50 font-medium">
                      {deck.downloadsCount.toLocaleString()} learners
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#fcf1d0] leading-snug">
                    {deck.title}
                  </h4>

                  <p className="text-xs text-[#fcf1d0]/70 line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#22396f] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0d1c42] text-[10px] font-bold text-[#fcf1d0] border border-[#22396f]">
                      {deck.author[0]}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#fcf1d0]">{deck.author}</p>
                      <p className="text-[10px] text-[#fcf1d0]/50">{deck.authorBadge}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClone(deck)}
                    disabled={isCloned}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      isCloned
                        ? 'bg-[#0d1c42] text-[#fcf1d0]/60 border border-[#22396f]'
                        : 'bg-[#fcf1d0] hover:bg-[#fcf1d0]/90 text-[#010736] shadow-md'
                    }`}
                  >
                    {isCloned ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        <span>Add ({deck.cards_count} Cards)</span>
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
