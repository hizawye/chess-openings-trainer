import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { useChessGame } from '../hooks/useChessGame';
import { useComputerOpponent } from '../hooks/useComputerOpponent';
import { getOpeningById, getVariationById } from '../data/openings';
import { ChessboardWrapper } from '../components/chessboard';
import type { Opening, Variation } from '../types';
import styles from './PlayPage.module.css';

export default function PlayPage() {
  const navigate = useNavigate();
  const { openingId, variationId } = useParams<{ openingId: string; variationId: string }>();

  const [opening, setOpening] = useState<Opening | null>(null);
  const [variation, setVariation] = useState<Variation | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'hint'; message: string } | null>(null);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [trainingMode, setTrainingMode] = useState<'demo' | 'practice' | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showMoves, setShowMoves] = useState(true);

  const { state, position, makeMove, makeMoveFromSan, getLegalMoves, reset: resetGame } = useChessGame();

  // Load opening and variation
  useEffect(() => {
    if (openingId && variationId) {
      const result = getVariationById(openingId, variationId);
      if (result) {
        setOpening(result.opening);
        setVariation(result.variation);
        // Set player color opposite to opening color by default
        setPlayerColor(result.opening.color === 'white' ? 'black' : 'white');
      }
    }
  }, [openingId, variationId]);

  const computerOpponent = useComputerOpponent({
    opening: opening!,
    variation: variation || undefined,
    playerColor,
  });

  // Make computer move
  const makeComputerMove = useCallback(() => {
    if (!position) return;

    setTimeout(() => {
      const computerMove = computerOpponent.getComputerMove(position);
      if (computerMove) {
        const success = makeMove(computerMove, computerMove);
        if (!success) {
          console.error('Computer failed to make move:', computerMove);
        }
      }
    }, 500);
  }, [position, computerOpponent, makeMove]);

  // Handle player move
  const handleMove = useCallback((from: string, to: string) => {
    // Disable moves during demo mode
    if (trainingMode === 'demo') return false;

    // In practice mode, allow any legal move
    if (trainingMode === 'practice') {
      const success = makeMove(from, to);
      if (!success) return false;

      // Check if move is correct in opening
      const moveHistory = state.history;
      const lastMove = moveHistory[moveHistory.length - 1];

      if (!computerOpponent.isCorrectOpeningMove(lastMove)) {
        setFeedback({
          type: 'incorrect',
          message: `Not quite! Expected: ${computerOpponent.getExpectedMove()?.san}`,
        });
      } else {
        setFeedback({
          type: 'correct',
          message: 'Correct move!',
        });
      }

      setTimeout(() => setFeedback(null), 2000);
      return true;
    }

    // Regular game mode with computer opponent
    if (state.turn !== playerColor) return false;

    const success = makeMove(from, to);
    if (!success) return false;

    // Check if move is correct in opening
    if (computerOpponent.isInOpening()) {
      // Get the SAN of the move that was just made
      const moveHistory = state.history;
      const lastMove = moveHistory[moveHistory.length - 1];

      if (!computerOpponent.isCorrectOpeningMove(lastMove)) {
        setFeedback({
          type: 'incorrect',
          message: `That's not the opening move! Expected: ${computerOpponent.getExpectedMove()?.san}`,
        });
        return true;
      } else {
        setFeedback({
          type: 'correct',
          message: 'Correct move!',
        });
      }
    }

    // Clear feedback after a moment
    setTimeout(() => setFeedback(null), 2000);

    // Make computer move after player
    makeComputerMove();

    return true;
  }, [state, playerColor, computerOpponent, makeMove, makeComputerMove, trainingMode]);

  // Computer moves first if it's playing white
  useEffect(() => {
    if (hasGameStarted && opening && !trainingMode && state.turn !== playerColor && state.history.length === 0) {
      makeComputerMove();
    }
  }, [hasGameStarted, opening, trainingMode, state.turn, state.history.length, playerColor, makeComputerMove]);

  // Check game status
  useEffect(() => {
    if (state.isCheckmate) {
      setGameStatus(state.turn === playerColor ? 'lost' : 'won');
    } else if (state.isStalemate) {
      setGameStatus('draw');
    }
  }, [state.isCheckmate, state.isStalemate, state.turn, playerColor]);

  const handleReset = () => {
    resetGame();
    computerOpponent.reset();
    setGameStatus('playing');
    setFeedback(null);
    setHasGameStarted(false);
    setTrainingMode(null);
    setIsAutoPlaying(false);
    setShowMoves(true);
  };

  const handleColorSwitch = (color: 'white' | 'black') => {
    setPlayerColor(color);
    handleReset();
  };

  const handleStartGame = () => {
    setHasGameStarted(true);
  };

  const handleStartDemo = useCallback(() => {
    setTrainingMode('demo');
    setHasGameStarted(true);
    setShowMoves(true);
    setIsAutoPlaying(true);
  }, []);

  const handleStartPractice = useCallback(() => {
    resetGame();
    computerOpponent.reset();
    setTrainingMode('practice');
    setHasGameStarted(true);
    setShowMoves(false);
    setIsAutoPlaying(false);
    setGameStatus('playing');
    setFeedback(null);
  }, [resetGame, computerOpponent]);

  // Auto-play demo mode
  useEffect(() => {
    if (!isAutoPlaying || !opening || trainingMode !== 'demo') return;

    const openingMoves = [
      ...(opening.startingMoves || []),
      ...(variation?.moves || opening.variations[0]?.moves || [])
    ];

    if (state.history.length >= openingMoves.length) {
      setIsAutoPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const nextMove = openingMoves[state.history.length];
      if (nextMove && position) {
        makeMoveFromSan(nextMove.san);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAutoPlaying, opening, variation, state.history.length, position, makeMoveFromSan, trainingMode]);

  const handleHint = () => {
    const hint = computerOpponent.getHint();
    if (hint) {
      setFeedback({
        type: 'hint',
        message: `Hint: ${hint}`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({
        type: 'hint',
        message: 'No hint available - play any legal move!',
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  if (!opening) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Opening not found</p>
          <button onClick={() => navigate('/openings')} className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Openings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/openings')} className={styles.backButton}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className={styles.headerInfo}>
          <h2>{opening.name}</h2>
          {variation && <p className={styles.variationName}>{variation.name}</p>}

          {!hasGameStarted ? (
            <div className={styles.colorSelector}>
              <p className={styles.colorLabel}>Choose training mode:</p>
              <div className={styles.modeButtons}>
                <button onClick={handleStartDemo} className={styles.modeButton}>
                  <span className={styles.modeIcon}>▶</span>
                  <div className={styles.modeText}>
                    <strong>Watch Demo</strong>
                    <small>See all moves played automatically</small>
                  </div>
                </button>
                <button onClick={handleStartPractice} className={styles.modeButton}>
                  <span className={styles.modeIcon}>🧠</span>
                  <div className={styles.modeText}>
                    <strong>Practice Mode</strong>
                    <small>Try to remember the moves</small>
                  </div>
                </button>
              </div>

              <div className={styles.divider}>or play vs computer</div>

              <p className={styles.colorLabel}>Choose your color:</p>
              <div className={styles.colorButtons}>
                <button
                  onClick={() => handleColorSwitch('white')}
                  className={`${styles.colorButton} ${playerColor === 'white' ? styles.active : ''}`}
                >
                  ♔ White
                </button>
                <button
                  onClick={() => handleColorSwitch('black')}
                  className={`${styles.colorButton} ${playerColor === 'black' ? styles.active : ''}`}
                >
                  ♚ Black
                </button>
              </div>
              <button onClick={handleStartGame} className={styles.startButton}>
                Start Game
              </button>
            </div>
          ) : (
            <p className={styles.playerInfo}>
              {trainingMode === 'demo' && 'Watching Demo'}
              {trainingMode === 'practice' && 'Practice Mode - Try to remember!'}
              {!trainingMode && `You are playing as ${playerColor === 'white' ? 'White' : 'Black'}`}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          {trainingMode === 'demo' && !isAutoPlaying && (
            <button onClick={handleStartPractice} className={styles.practiceButton} title="Start practice">
              Start Practice
            </button>
          )}
          {trainingMode === 'practice' && (
            <>
              <button
                onClick={() => setShowMoves(!showMoves)}
                className={styles.toggleMovesButton}
                title={showMoves ? "Hide moves" : "Show moves"}
              >
                {showMoves ? '👁️' : '👁️‍🗨️'}
              </button>
              <button onClick={handleHint} className={styles.hintButton} title="Get hint">
                <Lightbulb size={20} />
              </button>
            </>
          )}
          {!trainingMode && (
            <button onClick={handleHint} className={styles.hintButton} title="Get hint">
              <Lightbulb size={20} />
            </button>
          )}
          <button onClick={handleReset} className={styles.resetButton} title="Restart game">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.boardSection}>
          <ChessboardWrapper
            fen={state.fen}
            orientation={trainingMode ? 'white' : playerColor}
            turnColor={state.turn}
            check={state.isCheck}
            movable={{
              color: trainingMode === 'demo' ? undefined : state.turn,
              dests: trainingMode === 'demo' ? new Map() : getLegalMoves(),
              showDests: true,
            }}
            onMove={handleMove}
          />

          {feedback && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.type === 'correct' && <CheckCircle size={20} />}
              {feedback.type === 'incorrect' && <XCircle size={20} />}
              {feedback.type === 'hint' && <Lightbulb size={20} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {computerOpponent.isInOpening() && (
            <div className={styles.openingIndicator}>
              <div className={styles.badge}>In Opening</div>
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.card}>
            <h3>Game Status</h3>
            <div className={styles.statusContent}>
              {gameStatus === 'playing' && (
                <p className={styles.playing}>
                  {state.turn === playerColor ? 'Your turn' : 'Computer is thinking...'}
                </p>
              )}
              {gameStatus === 'won' && (
                <p className={styles.won}>🎉 You won!</p>
              )}
              {gameStatus === 'lost' && (
                <p className={styles.lost}>Computer won</p>
              )}
              {gameStatus === 'draw' && (
                <p className={styles.draw}>Draw!</p>
              )}
              {state.isCheck && gameStatus === 'playing' && (
                <p className={styles.check}>Check!</p>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Move History</h3>
            <div className={styles.moveHistory}>
              {!showMoves && trainingMode === 'practice' ? (
                <div className={styles.hiddenMoves}>
                  <p className={styles.hiddenMessage}>Moves hidden - try to remember!</p>
                  <p className={styles.moveCount}>{state.history.length} moves played</p>
                </div>
              ) : state.history.length === 0 ? (
                <p className={styles.noMoves}>No moves yet</p>
              ) : (
                <div className={styles.moves}>
                  {state.history.map((move, index) => {
                    const moveNumber = Math.floor(index / 2) + 1;
                    const isWhiteMove = index % 2 === 0;
                    return (
                      <div key={index} className={styles.moveItem}>
                        {isWhiteMove && <span className={styles.moveNumber}>{moveNumber}.</span>}
                        <span className={styles.move}>{move}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {opening.description && (
            <div className={styles.card}>
              <h3>About this Opening</h3>
              <p className={styles.description}>{opening.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
