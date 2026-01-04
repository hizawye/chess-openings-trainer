export interface VariationProgress {
  variationId: string;
  completedAt?: string;      // ISO date string
  attempts: number;
  bestScore: number;         // Percentage of correct moves
  lastAttemptAt: string;
}

export interface OpeningProgress {
  openingId: string;
  variations: Record<string, VariationProgress>;
}

export interface ProgressState {
  openings: Record<string, OpeningProgress>;
  totalCompleted: number;
  lastPracticed?: string;
}

export const defaultProgress: ProgressState = {
  openings: {},
  totalCompleted: 0,
};
