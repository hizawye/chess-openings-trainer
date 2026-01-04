import { useState, useCallback, useMemo } from 'react';
import { Chess, parseUci, parseSquare } from 'chessops';
import { parseFen, makeFen } from 'chessops/fen';
import { makeSan, parseSan } from 'chessops/san';
import { chessgroundDests } from 'chessops/compat';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export interface ChessGameState {
  fen: string;
  turn: 'white' | 'black';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isGameOver: boolean;
  history: string[];
}

export interface UseChessGameReturn {
  state: ChessGameState;
  position: Chess | null;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  makeMoveFromSan: (san: string) => boolean;
  makeMoveFromUci: (uci: string) => boolean;
  isLegalMove: (from: string, to: string) => boolean;
  getLegalMoves: () => Map<string, string[]>;
  reset: () => void;
  loadFen: (fen: string) => boolean;
  undo: () => boolean;
}

export function useChessGame(initialFen: string = INITIAL_FEN): UseChessGameReturn {
  const [fen, setFen] = useState(initialFen);
  const [history, setHistory] = useState<string[]>([]);

  const position = useMemo(() => {
    const setup = parseFen(fen);
    if (setup.isErr) return null;
    const pos = Chess.fromSetup(setup.unwrap());
    if (pos.isErr) return null;
    return pos.unwrap();
  }, [fen]);

  const state: ChessGameState = useMemo(() => {
    if (!position) {
      return {
        fen,
        turn: 'white',
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        isGameOver: false,
        history,
      };
    }

    return {
      fen,
      turn: position.turn === 'white' ? 'white' : 'black',
      isCheck: position.isCheck(),
      isCheckmate: position.isCheckmate(),
      isStalemate: position.isStalemate(),
      isGameOver: position.isEnd(),
      history,
    };
  }, [position, fen, history]);

  const makeMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!position) return false;

    const fromSquare = parseSquare(from);
    const toSquare = parseSquare(to);
    if (fromSquare === undefined || toSquare === undefined) return false;

    // Build UCI string
    let uci = from + to;
    if (promotion) {
      uci += promotion.toLowerCase();
    }

    const move = parseUci(uci);
    if (!move) return false;

    // Clone position and try the move
    const newPos = position.clone();

    // Check if it's a legal move
    if (!newPos.isLegal(move)) return false;

    // Make the move
    const san = makeSan(newPos, move);
    newPos.play(move);

    // Update state
    setFen(makeFen(newPos.toSetup()));
    setHistory(prev => [...prev, san]);

    return true;
  }, [position]);

  const makeMoveFromSan = useCallback((san: string): boolean => {
    if (!position) return false;

    const move = parseSan(position, san);
    if (!move) return false;

    const newPos = position.clone();
    newPos.play(move);

    setFen(makeFen(newPos.toSetup()));
    setHistory(prev => [...prev, san]);

    return true;
  }, [position]);

  const makeMoveFromUci = useCallback((uci: string): boolean => {
    if (!position) return false;

    const move = parseUci(uci);
    if (!move) return false;

    if (!position.isLegal(move)) return false;

    const newPos = position.clone();
    const san = makeSan(newPos, move);
    newPos.play(move);

    setFen(makeFen(newPos.toSetup()));
    setHistory(prev => [...prev, san]);

    return true;
  }, [position]);

  const isLegalMove = useCallback((from: string, to: string): boolean => {
    if (!position) return false;

    const uci = from + to;
    const move = parseUci(uci);
    if (!move) return false;

    return position.isLegal(move);
  }, [position]);

  const getLegalMoves = useCallback((): Map<string, string[]> => {
    if (!position) return new Map();
    return chessgroundDests(position);
  }, [position]);

  const reset = useCallback(() => {
    setFen(INITIAL_FEN);
    setHistory([]);
  }, []);

  const loadFen = useCallback((newFen: string): boolean => {
    const setup = parseFen(newFen);
    if (setup.isErr) return false;

    const pos = Chess.fromSetup(setup.unwrap());
    if (pos.isErr) return false;

    setFen(newFen);
    setHistory([]);
    return true;
  }, []);

  const undo = useCallback((): boolean => {
    // For simplicity, we'll just reload from initial position
    // A full undo would require storing all positions
    if (history.length === 0) return false;

    // Replay all moves except the last one
    const newHistory = history.slice(0, -1);

    let currentFen = INITIAL_FEN;
    const setup = parseFen(currentFen);
    if (setup.isErr) return false;

    const pos = Chess.fromSetup(setup.unwrap());
    if (pos.isErr) return false;

    const currentPos = pos.unwrap();

    for (const san of newHistory) {
      const move = parseSan(currentPos, san);
      if (!move) return false;
      currentPos.play(move);
    }

    setFen(makeFen(currentPos.toSetup()));
    setHistory(newHistory);
    return true;
  }, [history]);

  return {
    state,
    position,
    makeMove,
    makeMoveFromSan,
    makeMoveFromUci,
    isLegalMove,
    getLegalMoves,
    reset,
    loadFen,
    undo,
  };
}
