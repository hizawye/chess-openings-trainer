import type { Opening } from '../types';

export type CategoryType = 'first-move' | 'style';

export interface Category {
  id: string;
  name: string;
  description?: string;
  matcher: (opening: Opening) => boolean;
}

export const firstMoveCategories: Category[] = [
  {
    id: 'king-pawn',
    name: "King's Pawn (1.e4)",
    description: "Open games starting with 1.e4",
    matcher: (o) => o.tags?.includes('1.e4') || o.startingMoves[0]?.san === 'e4'
  },
  {
    id: 'queen-pawn',
    name: "Queen's Pawn (1.d4)",
    description: "Closed games starting with 1.d4",
    matcher: (o) => o.tags?.includes('1.d4') || o.startingMoves[0]?.san === 'd4'
  },
  {
    id: 'english',
    name: "English (1.c4)",
    description: "Flank opening with 1.c4",
    matcher: (o) => o.tags?.includes('1.c4') || o.startingMoves[0]?.san === 'c4'
  },
  {
    id: 'flank',
    name: "Other Flank Openings",
    description: "Réti, Bird's, and other hypermodern openings",
    matcher: (o) => o.tags?.includes('flank') ||
                   o.tags?.includes('hypermodern') ||
                   ['Nf3', 'f4', 'b3'].includes(o.startingMoves[0]?.san)
  }
];

export const styleCategories: Category[] = [
  {
    id: 'gambit',
    name: "Gambits",
    description: "Aggressive pawn sacrifices for rapid development",
    matcher: (o) => o.tags?.includes('gambit') || o.name.toLowerCase().includes('gambit')
  },
  {
    id: 'tactical',
    name: "Tactical & Sharp",
    description: "Complex tactical positions with sharp play",
    matcher: (o) => o.tags?.some(t => ['tactical', 'sharp', 'aggressive'].includes(t)) ?? false
  },
  {
    id: 'positional',
    name: "Positional & Strategic",
    description: "Strategic play focusing on structure and long-term plans",
    matcher: (o) => o.tags?.some(t => ['positional', 'strategic', 'solid'].includes(t)) ?? false
  },
  {
    id: 'system',
    name: "System Openings",
    description: "Set formations that work against many defenses",
    matcher: (o) => o.tags?.includes('system') ||
                   ['London System', 'Colle System', 'Torre Attack', 'Stonewall Attack'].includes(o.name)
  },
  {
    id: 'beginner',
    name: "Beginner-Friendly",
    description: "Easy to learn with clear plans",
    matcher: (o) => o.tags?.includes('beginner-friendly') ?? false
  }
];
