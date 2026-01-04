import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { ChessboardWrapper } from '../components/chessboard';
import { getVariationById } from '../data/openings';
import { useChessGame } from '../hooks/useChessGame';
import type { Move } from '../types';
import styles from './TrainingPage.module.css';

export default function TrainingPage() {
  const { openingId, variationId } = useParams<{
    openingId: string;
    variationId: string;
  }>();
  const navigate = useNavigate();

  const data = useMemo(() => {
    if (!openingId || !variationId) return null;
    return getVariationById(openingId, variationId);
  }, [openingId, variationId]);

  if (!data) {
    return (
      <div className={styles.notFound}>
        <h2>Opening not found</h2>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to openings
        </Link>
      </div>
    );
  }

  return (
    <TrainingSession
      opening={data.opening}
      variation={data.variation}
      onBack={() => navigate('/')}
    />
  );
}

interface TrainingSessionProps {
  opening: { id: string; name: string; color: 'white' | 'black'; startingMoves: Move[] };
  variation: { id: string; name: string; moves: Move[]; description?: string };
  onBack: () => void;
}

function TrainingSession({ opening, variation, onBack }: TrainingSessionProps) {
  const { state, getLegalMoves, makeMoveFromUci, reset } = useChessGame();

  // Combine starting moves with variation moves
  const allMoves = useMemo(
    () => [...opening.startingMoves, ...variation.moves],
    [opening.startingMoves, variation.moves]
  );

  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [lastMove, setLastMove] = useState<[string, string] | undefined>();

  // Determine if it's the user's turn
  const isUserTurn = useMemo(() => {
    const moveNumber = currentMoveIndex;
    const isWhiteToMove = moveNumber % 2 === 0;
    return (opening.color === 'white' && isWhiteToMove) ||
           (opening.color === 'black' && !isWhiteToMove);
  }, [currentMoveIndex, opening.color]);

  // Get the expected move
  const expectedMove = allMoves[currentMoveIndex];

  // Auto-play opponent moves
  useEffect(() => {
    if (!isUserTurn && currentMoveIndex < allMoves.length && !isComplete) {
      const timer = setTimeout(() => {
        const move = allMoves[currentMoveIndex];
        makeMoveFromUci(move.uci);
        setLastMove([move.uci.slice(0, 2), move.uci.slice(2, 4)]);
        setCurrentMoveIndex((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isUserTurn, currentMoveIndex, allMoves, makeMoveFromUci, isComplete]);

  // Check for completion
  useEffect(() => {
    if (currentMoveIndex >= allMoves.length && !isComplete) {
      setIsComplete(true);
    }
  }, [currentMoveIndex, allMoves.length, isComplete]);

  const handleMove = useCallback(
    (from: string, to: string) => {
      if (!isUserTurn || !expectedMove || isComplete) return;

      const userUci = from + to;
      const expectedUci = expectedMove.uci;

      // Handle promotions (just check first 4 chars)
      const isCorrect =
        userUci === expectedUci.slice(0, 4) ||
        userUci === expectedUci;

      if (isCorrect) {
        makeMoveFromUci(expectedMove.uci);
        setLastMove([from, to]);
        setFeedback('correct');
        setCorrectCount((prev) => prev + 1);
        setCurrentMoveIndex((prev) => prev + 1);

        setTimeout(() => setFeedback(null), 500);
      } else {
        setFeedback('incorrect');
        setIncorrectCount((prev) => prev + 1);

        setTimeout(() => setFeedback(null), 500);
      }
    },
    [isUserTurn, expectedMove, isComplete, makeMoveFromUci]
  );

  const handleRestart = useCallback(() => {
    reset();
    setCurrentMoveIndex(0);
    setFeedback(null);
    setIsComplete(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setLastMove(undefined);
  }, [reset]);

  // Get legal moves for the board
  const legalMoves = isUserTurn && !isComplete ? getLegalMoves() : new Map();

  // Calculate progress
  const progressPercent = (currentMoveIndex / allMoves.length) * 100;

  // Get arrow for expected move hint (only show after wrong move)
  const arrows: Array<[string, string]> = [];
  if (feedback === 'incorrect' && expectedMove) {
    arrows.push([expectedMove.uci.slice(0, 2), expectedMove.uci.slice(2, 4)]);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backBtn}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerInfo}>
          <h1>{opening.name}</h1>
          <h2>{variation.name}</h2>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.boardSection}>
          <div className={styles.boardWrapper}>
            <ChessboardWrapper
              fen={state.fen}
              orientation={opening.color}
              turnColor={state.turn}
              check={state.isCheck}
              lastMove={lastMove}
              movable={{
                color: isUserTurn && !isComplete ? opening.color : undefined,
                dests: legalMoves,
                showDests: true,
              }}
              onMove={handleMove}
              arrows={arrows}
            />

            {feedback && (
              <div className={`${styles.feedback} ${styles[feedback]}`}>
                {feedback === 'correct' ? (
                  <CheckCircle size={48} />
                ) : (
                  <XCircle size={48} />
                )}
              </div>
            )}
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className={styles.controls}>
            <button onClick={handleRestart} className={styles.controlBtn}>
              <RotateCcw size={20} />
              Restart
            </button>
          </div>
        </div>

        <div className={styles.infoSection}>
          {isComplete ? (
            <div className={styles.completeCard}>
              <CheckCircle size={48} className={styles.completeIcon} />
              <h3>Variation Complete!</h3>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{correctCount}</span>
                  <span className={styles.statLabel}>Correct</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{incorrectCount}</span>
                  <span className={styles.statLabel}>Mistakes</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>
                    {Math.round((correctCount / (correctCount + incorrectCount)) * 100) || 100}%
                  </span>
                  <span className={styles.statLabel}>Accuracy</span>
                </div>
              </div>
              <div className={styles.completeActions}>
                <button onClick={handleRestart} className={styles.btn}>
                  Practice Again
                </button>
                <button onClick={onBack} className={`${styles.btn} ${styles.btnPrimary}`}>
                  Choose Another
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.moveCard}>
                <h3>Your Move</h3>
                {isUserTurn && expectedMove ? (
                  <p className={styles.instruction}>
                    Play the correct move for {opening.color}
                  </p>
                ) : (
                  <p className={styles.instruction}>Wait for opponent's move...</p>
                )}
              </div>

              <div className={styles.moveList}>
                <h3>Move Sequence</h3>
                <div className={styles.moves}>
                  {allMoves.map((move, idx) => (
                    <span
                      key={idx}
                      className={`${styles.move} ${
                        idx < currentMoveIndex ? styles.played : ''
                      } ${idx === currentMoveIndex ? styles.current : ''}`}
                    >
                      {idx % 2 === 0 && (
                        <span className={styles.moveNumber}>
                          {Math.floor(idx / 2) + 1}.
                        </span>
                      )}
                      {move.san}
                    </span>
                  ))}
                </div>
              </div>

              {expectedMove?.comment && currentMoveIndex > 0 && (
                <div className={styles.commentCard}>
                  <h4>Tip</h4>
                  <p>{allMoves[currentMoveIndex - 1]?.comment}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
