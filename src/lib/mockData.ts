import { Deck, Folder, StudyDocument } from '@/types';

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'f-cs', name: 'Computer Science', icon: 'Code', color: 'blue', created_at: new Date().toISOString() },
  { id: 'f-neuro', name: 'Cognitive Science', icon: 'Brain', color: 'indigo', created_at: new Date().toISOString() },
  { id: 'f-history', name: 'Modern History', icon: 'Globe', color: 'amber', created_at: new Date().toISOString() },
  { id: 'f-bio', name: 'Molecular Biology', icon: 'Dna', color: 'emerald', created_at: new Date().toISOString() },
];

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-cs-1',
    title: 'Data Structures & Algorithmic Complexity',
    description: 'Graph traversals, asymptotic runtime bounds, balanced trees, and dynamic programming.',
    category: 'Computer Science',
    folder_id: 'f-cs',
    cards_count: 4,
    due_count: 4,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c-cs-1',
        deck_id: 'deck-cs-1',
        card_type: 'flashcard',
        front: 'What is the worst-case time complexity of QuickSort, and what scenario triggers it?',
        back: 'O(n²). Occurs when the chosen pivot is repeatedly the smallest or largest element (such as an already sorted array with a naive end-pivot choice).',
        explanation: 'Randomized pivot selection or the Median-of-Three heuristic reduces this worst-case likelihood to expected O(n log n).',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-cs-2',
        deck_id: 'deck-cs-1',
        card_type: 'multiple_choice',
        front: 'Which graph algorithm computes the shortest path between a single source node and all other nodes in a weighted graph with non-negative edge weights?',
        back: "Dijkstra's Algorithm",
        distractors: [
          'Bellman-Ford Algorithm',
          'Floyd-Warshall Algorithm',
          "Kruskal's Minimum Spanning Tree"
        ],
        explanation: "Dijkstra's uses a priority queue (min-heap) to greedily expand the nearest unvisited vertex in O((V + E) log V) time.",
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-cs-3',
        deck_id: 'deck-cs-1',
        card_type: 'fill_blank',
        front: 'An AVL tree maintains balance by ensuring the height difference between the left and right subtrees of any node never exceeds ________.',
        back: '1',
        explanation: 'If the balance factor exceeds 1 or is less than -1, single or double tree rotations are executed to restore the logarithmic height bound.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-cs-4',
        deck_id: 'deck-cs-1',
        card_type: 'flashcard',
        front: 'What are the two foundational prerequisites for applying Dynamic Programming to an optimization problem?',
        back: '1. Optimal Substructure (optimal solution contains optimal solutions to subproblems).\n2. Overlapping Subproblems (the same subproblems are solved repeatedly).',
        explanation: 'Without overlapping subproblems, divide-and-conquer suffices; without optimal substructure, greedy or search methods are required.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'deck-neuro-1',
    title: 'Learning Systems, Memory & Neuroplasticity',
    description: 'Long-term potentiation, hippocampal encoding, spacing effect, and retrieval practice.',
    category: 'Cognitive Science',
    folder_id: 'f-neuro',
    cards_count: 3,
    due_count: 3,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c-neuro-1',
        deck_id: 'deck-neuro-1',
        card_type: 'multiple_choice',
        front: 'Which cellular mechanism represents the primary biological foundation of synaptic plasticity and long-term memory formation in the hippocampus?',
        back: 'Long-Term Potentiation (LTP) via NMDA receptor activation',
        distractors: [
          'Axonal demyelination and retrograde transport',
          'Selective serotonin reuptake inhibition',
          'Glial cell phagocytosis in the cerebellum'
        ],
        explanation: 'Postsynaptic depolarization expels magnesium ions from NMDA receptors, allowing calcium influx that upregulates AMPA receptors.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-neuro-2',
        deck_id: 'deck-neuro-1',
        card_type: 'flashcard',
        front: 'Why is active retrieval practice significantly superior to passive re-reading for long-term retention?',
        back: 'Retrieval effort strengthens neural access routes and induces reconsolidation, whereas passive re-reading merely creates an illusion of competence without durable storage.',
        explanation: 'Known as the "Testing Effect" (Roediger & Karpicke), retrieval forces cognitive reconstruction that resists memory decay.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-neuro-3',
        deck_id: 'deck-neuro-1',
        card_type: 'fill_blank',
        front: 'The Ebbinghaus forgetting curve demonstrates that memory decay is steepest immediately after learning, and that review sessions spaced over time produce ________ consolidation.',
        back: 'exponential',
        explanation: 'Each spaced review flattens the trajectory of the forgetting curve, extending the time interval required before the next decay cycle.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'deck-history-1',
    title: 'Modern Diplomatic History & Global Treaties',
    description: 'Westphalian sovereignty, Bretton Woods, Cold War containment, and international legal accords.',
    category: 'Modern History',
    folder_id: 'f-history',
    cards_count: 3,
    due_count: 3,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c-hist-1',
        deck_id: 'deck-history-1',
        card_type: 'flashcard',
        front: 'What core principle of international law was formalized by the 1648 Peace of Westphalia?',
        back: 'Westphalian Sovereignty: Nation-states hold exclusive jurisdiction over their domestic affairs and religion, barring foreign intervention.',
        explanation: 'This marked the transition from medieval transnational religious authorities (the Holy Roman Empire and Papacy) to sovereign nation-states.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-hist-2',
        deck_id: 'deck-history-1',
        card_type: 'multiple_choice',
        front: 'Which landmark 1944 conference established the International Monetary Fund (IMF) and the World Bank to govern postwar global finance?',
        back: 'The Bretton Woods Conference',
        distractors: [
          'The Yalta Conference',
          'The Treaty of Versailles',
          'The Potsdam Accord'
        ],
        explanation: 'Convened in New Hampshire, 44 allied nations pegged global currencies to the US dollar, which was in turn convertible to gold.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-hist-3',
        deck_id: 'deck-history-1',
        card_type: 'fill_blank',
        front: 'Article ________ of the North Atlantic Treaty codifies the collective defense clause: an attack against one ally is considered an attack against all.',
        back: '5',
        explanation: 'First invoked following the September 11, 2001 attacks, Article 5 forms the core deterrence backbone of NATO.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'deck-bio-1',
    title: 'Molecular Genetics & CRISPR Gene Regulation',
    description: 'Central dogma mechanisms, epigenetic methylation, DNA repair, and endonuclease engineering.',
    category: 'Molecular Biology',
    folder_id: 'f-bio',
    cards_count: 2,
    due_count: 2,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c-bio-1',
        deck_id: 'deck-bio-1',
        card_type: 'flashcard',
        front: 'In the CRISPR-Cas9 genome editing system, what is the role of the Protospacer Adjacent Motif (PAM)?',
        back: 'The PAM sequence (e.g. 5\'-NGG-3\' for SpCas9) is an essential binding recognition site adjacent to the target DNA; Cas9 will not cleave without it.',
        explanation: 'PAM binding triggers local DNA melting, allowing the single-guide RNA (sgRNA) to anneal to the complementary target strand.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-bio-2',
        deck_id: 'deck-bio-1',
        card_type: 'multiple_choice',
        front: 'How does DNA methylation at CpG islands typically influence eukaryotic gene expression?',
        back: 'Silences transcription by recruiting histone deacetylases and condensing chromatin into heterochromatin.',
        distractors: [
          'Accelerates RNA polymerase II binding and enhances transcription',
          'Triggers immediate alternative splicing in the nucleus',
          'Causes irreversible double-stranded break degradation'
        ],
        explanation: 'Methylated cytosines recruit methyl-CpG-binding domain proteins (MBDs), promoting gene transcriptional repression.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export const INITIAL_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc-cs-1',
    title: 'Data Structures and Graph Traversal Algorithms',
    file_name: 'CS102_Data_Structures_Graph_Algorithms.pdf',
    folder_id: 'f-cs',
    total_pages: 2,
    pages: [
      {
        pageNumber: 1,
        text: `CS 102 — ADVANCED DATA STRUCTURES & ALGORITHMS\nInstructional Module: Graph Traversals and Shortest Paths\n\n1. Graph Representation\nA graph G = (V, E) consists of a set of vertices V and edges E. Common representations:\n• Adjacency Matrix: V x V boolean/weight matrix. Space O(V²). Optimal for dense graphs.\n• Adjacency List: Array of linked lists or vectors. Space O(V + E). Optimal for sparse graphs.\n\n2. Breadth-First Search (BFS)\n• Traversal order: Level by level using a First-In, First-Out (FIFO) queue.\n• Finds unweighted shortest path in O(V + E) time.\n• Essential for peer-to-peer network routing, web crawlers, and cycle detection in undirected graphs.\n\n3. Depth-First Search (DFS)\n• Traversal order: Follows branch to deepest leaf before backtracking, using a call stack or explicit LIFO stack.\n• Time complexity: O(V + E). Space complexity: O(V) for the recursion stack.\n• Applications: Topological sorting in Directed Acyclic Graphs (DAGs) and finding Strongly Connected Components (SCCs).`
      },
      {
        pageNumber: 2,
        text: `SHORTEST PATH PRINCIPLES & HEURISTICS\n\n1. Dijkstra's Algorithm\n• Solves the single-source shortest path problem on graphs with non-negative edge weights.\n• Mechanism: Maintains a priority queue of tentative distances. Greedily visits the closest unvisited vertex.\n• Runtime: O((V + E) log V) with a binary min-heap; O(E + V log V) with a Fibonacci heap.\n\n2. Bellman-Ford Algorithm\n• Computes shortest paths with negative edge weights and detects negative weight cycles.\n• Mechanism: Relaxes all |E| edges |V| - 1 times.\n• Runtime: O(V * E).\n\n3. A* Search Heuristic\n• Extends Dijkstra by adding an admissible heuristic h(n) estimating remaining distance to target.\n• Evaluation function: f(n) = g(n) + h(n), where g(n) is the exact cost incurred from start.\n• If h(n) is consistent (monotone), A* is guaranteed to return the optimal shortest path without reopening closed nodes.`
      }
    ],
    highlights: [
      {
        id: 'hl-cs-1',
        pageNumber: 1,
        text: 'Breadth-First Search finds unweighted shortest path in O(V + E) time.',
        color: 'yellow',
        created_at: new Date().toISOString()
      },
      {
        id: 'hl-cs-2',
        pageNumber: 2,
        text: 'A* Search Heuristic: Evaluation function f(n) = g(n) + h(n)',
        color: 'green',
        created_at: new Date().toISOString()
      }
    ],
    notes: [
      {
        id: 'n-cs-1',
        pageNumber: 1,
        text: 'Exam note: Remember Dijkstra fails on negative edge weights because greedy selection assumes path costs only increase.',
        color: 'blue',
        created_at: new Date().toISOString()
      }
    ],
    content: 'Full academic text for Data Structures and Graph Traversal Algorithms',
    created_at: new Date().toISOString(),
  },
  {
    id: 'doc-neuro-1',
    title: 'Cognitive Psychology: Mechanisms of Memory and Recall',
    file_name: 'PSYC201_Memory_Mechanisms_Recall.pdf',
    folder_id: 'f-neuro',
    total_pages: 2,
    pages: [
      {
        pageNumber: 1,
        text: `COGNITIVE NEUROSCIENCE: THE ARCHITECTURE OF MEMORY\nInstructional Module: Encoding, Consolidation, and Retrieval\n\n1. Multi-Store Memory Model (Atkinson & Shiffrin)\n• Sensory Memory: Millisecond retention of sensory impressions (iconic and echoic).\n• Working Memory (Baddeley & Hitch): Central executive, phonological loop, visuospatial sketchpad, and episodic buffer. Capacity ~4-7 chunks.\n• Long-Term Memory: Declarative (explicit: episodic and semantic) vs Non-declarative (implicit: procedural and priming).\n\n2. Synaptic Consolidation and the Hippocampus\n• Information initially encoded in hippocampal circuits is gradually transferred to neocortical areas for permanent storage.\n• Long-Term Potentiation (LTP) represents the sustained strengthening of synapses based on recent patterns of activity.\n• Sleep, particularly Slow-Wave Sleep (SWS), is critical for system-level memory consolidation.`
      },
      {
        pageNumber: 2,
        text: `EVIDENCE-BASED RETENTION STRATEGIES\n\n1. Spacing Effect & Distributed Practice\n• Distributing study sessions over expanded time intervals significantly outperforms massed practice (cramming).\n• Formulated mathematically in algorithms such as SM-2: interval I(n) = I(n-1) * EF.\n\n2. Testing Effect & Desirable Difficulty\n• The act of actively retrieving information from memory alters the memory trace itself, making it more retrievable in the future.\n• Bjork\'s Desirable Difficulties theory: Conditions that make learning feel harder and slower in the short term (such as spacing and interleaved practice) produce superior long-term retention.\n\n3. Elaborative Encoding\n• Connecting novel concepts to existing knowledge structures (schema) generates richer associative pathways, facilitating multi-modal recall.`
      }
    ],
    highlights: [
      {
        id: 'hl-neuro-1',
        pageNumber: 1,
        text: 'Long-Term Potentiation (LTP) represents the sustained strengthening of synapses',
        color: 'yellow',
        created_at: new Date().toISOString()
      },
      {
        id: 'hl-neuro-2',
        pageNumber: 2,
        text: 'Actively retrieving information from memory alters the memory trace itself',
        color: 'green',
        created_at: new Date().toISOString()
      }
    ],
    notes: [
      {
        id: 'n-neuro-1',
        pageNumber: 2,
        text: 'Core insight: Forgetting is not an error; it is a prerequisite for high-yield memory consolidation.',
        color: 'amber',
        created_at: new Date().toISOString()
      }
    ],
    content: 'Full academic text for Cognitive Psychology and Memory Mechanisms',
    created_at: new Date().toISOString(),
  }
];
