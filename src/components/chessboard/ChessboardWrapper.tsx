import { useEffect, useRef, useCallback } from 'react';
import { Chessground } from '@lichess-org/chessground';
import type { Api } from '@lichess-org/chessground/api';
import type { Config } from '@lichess-org/chessground/config';
import type { Key, Color } from '@lichess-org/chessground/types';
import '@lichess-org/chessground/assets/chessground.base.css';
import '@lichess-org/chessground/assets/chessground.brown.css';
import '@lichess-org/chessground/assets/chessground.cburnett.css';
import styles from './ChessboardWrapper.module.css';

export interface ChessboardWrapperProps {
  fen?: string;
  orientation?: Color;
  turnColor?: Color;
  lastMove?: [string, string];
  check?: Color | boolean;
  movable?: {
    free?: boolean;
    color?: Color | 'both';
    dests?: Map<string, string[]>;
    showDests?: boolean;
  };
  draggable?: {
    enabled?: boolean;
  };
  selectable?: {
    enabled?: boolean;
  };
  coordinates?: boolean;
  viewOnly?: boolean;
  highlight?: {
    lastMove?: boolean;
    check?: boolean;
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  onMove?: (from: string, to: string) => void;
  arrows?: Array<[string, string]>;
}

export default function ChessboardWrapper({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  orientation = 'white',
  turnColor = 'white',
  lastMove,
  check,
  movable = {},
  draggable = { enabled: true },
  selectable = { enabled: true },
  coordinates = true,
  viewOnly = false,
  highlight = { lastMove: true, check: true },
  animation = { enabled: true, duration: 200 },
  onMove,
  arrows = [],
}: ChessboardWrapperProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<Api | null>(null);

  const handleMove = useCallback(
    (orig: Key, dest: Key) => {
      if (onMove) {
        onMove(orig as string, dest as string);
      }
    },
    [onMove]
  );

  // Convert arrows to drawable shapes
  const autoShapes = arrows.map(([orig, dest]) => ({
    orig: orig as Key,
    dest: dest as Key,
    brush: 'green',
  }));

  // Initialize chessground
  useEffect(() => {
    if (!boardRef.current) return;

    const config: Config = {
      fen,
      orientation,
      turnColor,
      lastMove: lastMove as [Key, Key] | undefined,
      check,
      coordinates,
      viewOnly,
      highlight,
      animation,
      movable: {
        free: movable.free ?? false,
        color: movable.color ?? (viewOnly ? undefined : turnColor),
        dests: movable.dests as Map<Key, Key[]> | undefined,
        showDests: movable.showDests ?? true,
      },
      draggable: {
        enabled: draggable.enabled ?? true,
      },
      selectable: {
        enabled: selectable.enabled ?? true,
      },
      drawable: {
        enabled: true,
        visible: true,
        autoShapes,
      },
      events: {
        move: handleMove,
      },
    };

    groundRef.current = Chessground(boardRef.current, config);

    return () => {
      groundRef.current?.destroy();
      groundRef.current = null;
    };
  }, []);

  // Update board state when props change
  useEffect(() => {
    if (!groundRef.current) return;

    groundRef.current.set({
      fen,
      orientation,
      turnColor,
      lastMove: lastMove as [Key, Key] | undefined,
      check,
      movable: {
        free: movable.free ?? false,
        color: movable.color ?? (viewOnly ? undefined : turnColor),
        dests: movable.dests as Map<Key, Key[]> | undefined,
        showDests: movable.showDests ?? true,
      },
      drawable: {
        autoShapes,
      },
    });
  }, [fen, orientation, turnColor, lastMove, check, movable, viewOnly, autoShapes]);

  return (
    <div className={styles.boardContainer}>
      <div ref={boardRef} className={styles.board} />
    </div>
  );
}
