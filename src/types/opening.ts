// Represents a single move in a variation
export interface Move {
  san: string;           // Standard Algebraic Notation (e.g., "e4", "Nf3")
  uci: string;           // UCI notation (e.g., "e2e4", "g1f3")
  comment?: string;      // Optional explanation of the move
  annotation?: string;   // "!", "?", "!!", "??" etc.
}

// A variation is a sequence of moves with optional sub-variations
export interface Variation {
  id: string;            // Unique identifier
  name: string;          // e.g., "Giuoco Piano", "Evans Gambit"
  eco?: string;          // ECO code (e.g., "C50", "C51")
  moves: Move[];         // The main line moves
  subVariations?: Variation[];  // Branching lines
  description?: string;  // Brief description of the variation
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// A complete opening category
export interface Opening {
  id: string;            // Unique identifier
  name: string;          // e.g., "Italian Game", "Sicilian Defense"
  eco: string;           // Primary ECO code range
  color: 'white' | 'black';  // Which color plays this opening
  description: string;   // Overview of the opening
  icon?: string;         // Icon identifier for UI
  startingMoves: Move[]; // Moves that define this opening
  variations: Variation[];
  tags?: string[];       // For search/filtering
}

// The complete openings database
export interface OpeningsDatabase {
  version: string;
  lastUpdated: string;
  openings: Opening[];
}
