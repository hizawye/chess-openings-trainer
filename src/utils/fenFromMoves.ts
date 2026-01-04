import { Chess } from 'chessops';
import { parseFen, makeFen } from 'chessops/fen';
import { parseSan } from 'chessops/san';
import type { Move } from '../types';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/**
 * Converts an array of moves to a FEN position string
 * @param moves - Array of moves in SAN notation
 * @returns FEN string representing the position after all moves
 */
export function getFenFromMoves(moves: Move[]): string {
  if (!moves || moves.length === 0) {
    return INITIAL_FEN;
  }

  const setup = parseFen(INITIAL_FEN);
  if (setup.isErr) {
    console.error('Failed to parse initial FEN');
    return INITIAL_FEN;
  }

  const pos = Chess.fromSetup(setup.unwrap());
  if (pos.isErr) {
    console.error('Failed to create position from setup');
    return INITIAL_FEN;
  }

  const position = pos.unwrap();

  // Replay each move
  for (const move of moves) {
    const parsedMove = parseSan(position, move.san);
    if (!parsedMove) {
      console.error(`Invalid move: ${move.san} at position ${makeFen(position.toSetup())}`);
      break;
    }
    position.play(parsedMove);
  }

  return makeFen(position.toSetup());
}
