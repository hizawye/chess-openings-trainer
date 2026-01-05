import { useCallback, useRef } from 'react';
import { Chess } from 'chessops';
import { parseFen } from 'chessops/fen';
import { makeSan } from 'chessops/san';
import type { Opening, Variation, Move as OpeningMove } from '../types';

interface UseComputerOpponentProps {
  opening: Opening;
  variation?: Variation;
  playerColor: 'white' | 'black';
}

export function useComputerOpponent({
  opening,
  variation,
  playerColor,
}: UseComputerOpponentProps) {
  const moveIndexRef = useRef(0);
  const inOpeningRef = useRef(true);

  // Get all moves for the selected variation (or first variation if none selected)
  const getOpeningMoves = useCallback((): OpeningMove[] => {
    const startingMoves = opening.startingMoves || [];
    const variationMoves = variation?.moves || opening.variations[0]?.moves || [];
    return [...startingMoves, ...variationMoves];
  }, [opening, variation]);

  // Get the next computer move
  const getComputerMove = useCallback((currentPosition: Chess): string | null => {
    const openingMoves = getOpeningMoves();

    // Check if we're still in the opening
    if (inOpeningRef.current && moveIndexRef.current < openingMoves.length) {
      const nextMove = openingMoves[moveIndexRef.current];
      moveIndexRef.current++;

      // Check if opening is complete
      if (moveIndexRef.current >= openingMoves.length) {
        inOpeningRef.current = false;
      }

      return nextMove.san;
    }

    // After opening, play random legal move
    const legalMoves = Array.from(currentPosition.allLegalMoves());
    if (legalMoves.length === 0) return null;

    // Pick a random legal move
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    const san = makeSan(currentPosition, randomMove);

    return san;
  }, [getOpeningMoves]);

  // Check if a player move matches the opening
  const isCorrectOpeningMove = useCallback((playerMove: string): boolean => {
    const openingMoves = getOpeningMoves();

    if (!inOpeningRef.current || moveIndexRef.current >= openingMoves.length) {
      // Not in opening anymore, all moves are valid
      return true;
    }

    const expectedMove = openingMoves[moveIndexRef.current];
    const isCorrect = expectedMove.san === playerMove;

    if (isCorrect) {
      moveIndexRef.current++;
      // Check if opening is complete
      if (moveIndexRef.current >= openingMoves.length) {
        inOpeningRef.current = false;
      }
    }

    return isCorrect;
  }, [getOpeningMoves]);

  // Get hint for next player move
  const getHint = useCallback((): string | null => {
    const openingMoves = getOpeningMoves();

    if (inOpeningRef.current && moveIndexRef.current < openingMoves.length) {
      return openingMoves[moveIndexRef.current].san;
    }

    return null;
  }, [getOpeningMoves]);

  // Reset the game
  const reset = useCallback(() => {
    moveIndexRef.current = 0;
    inOpeningRef.current = true;
  }, []);

  // Check if still in opening
  const isInOpening = useCallback(() => {
    return inOpeningRef.current;
  }, []);

  // Get expected move
  const getExpectedMove = useCallback((): OpeningMove | null => {
    const openingMoves = getOpeningMoves();

    if (inOpeningRef.current && moveIndexRef.current < openingMoves.length) {
      return openingMoves[moveIndexRef.current];
    }

    return null;
  }, [getOpeningMoves]);

  return {
    getComputerMove,
    isCorrectOpeningMove,
    getHint,
    reset,
    isInOpening,
    getExpectedMove,
  };
}
