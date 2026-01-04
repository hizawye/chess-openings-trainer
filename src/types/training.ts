import type { Opening, Variation, Move } from './opening';

export type FeedbackType = 'correct' | 'incorrect' | null;

export interface TrainingState {
  opening: Opening | null;
  variation: Variation | null;
  currentMoveIndex: number;
  isUserTurn: boolean;
  gameHistory: Move[];
  feedback: FeedbackType;
  isComplete: boolean;
  correctMoves: number;
  incorrectMoves: number;
}

export type TrainingAction =
  | { type: 'START_TRAINING'; opening: Opening; variation: Variation }
  | { type: 'MAKE_MOVE'; move: string }
  | { type: 'OPPONENT_MOVE' }
  | { type: 'WRONG_MOVE'; attempted: string }
  | { type: 'SHOW_FEEDBACK'; feedback: FeedbackType }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'RESET' }
  | { type: 'COMPLETE' };

export interface TrainingSession {
  openingId: string;
  variationId: string;
  startedAt: string;
  completedAt?: string;
  correctMoves: number;
  incorrectMoves: number;
  score: number; // Percentage
}
