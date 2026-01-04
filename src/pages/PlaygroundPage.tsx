import { useState, useCallback } from 'react';
import { ChessboardWrapper, BoardControls } from '../components/chessboard';
import { useChessGame } from '../hooks/useChessGame';
import styles from './PlaygroundPage.module.css';

export default function PlaygroundPage() {
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const { state, getLegalMoves, makeMove, reset } = useChessGame();

  const handleMove = useCallback(
    (from: string, to: string) => {
      makeMove(from, to);
    },
    [makeMove]
  );

  const handleFlip = useCallback(() => {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  }, []);

  const legalMoves = getLegalMoves();

  return (
    <div className={styles.container}>
      <div className={styles.boardSection}>
        <ChessboardWrapper
          fen={state.fen}
          orientation={orientation}
          turnColor={state.turn}
          check={state.isCheck}
          movable={{
            color: state.turn,
            dests: legalMoves,
            showDests: true,
          }}
          onMove={handleMove}
        />
        <BoardControls
          orientation={orientation}
          onFlip={handleFlip}
          onReset={reset}
        />
      </div>

      <div className={styles.info}>
        <h3>Game Info</h3>
        <p>Turn: {state.turn}</p>
        <p>Check: {state.isCheck ? 'Yes' : 'No'}</p>
        <p>Checkmate: {state.isCheckmate ? 'Yes' : 'No'}</p>
        <p>Moves: {state.history.join(' ')}</p>
      </div>
    </div>
  );
}
