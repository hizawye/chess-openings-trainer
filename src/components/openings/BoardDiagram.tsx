import { useMemo } from 'react';
import { parseFen } from 'chessops/fen';
import styles from './BoardDiagram.module.css';

interface BoardDiagramProps {
  fen: string;
  size?: number;
  orientation?: 'white' | 'black';
}

// Unicode chess pieces
const PIECE_SYMBOLS: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟',
};

function getPieceSymbol(piece: { role: string; color: string }): string {
  const key = `${piece.color}-${piece.role}`;
  return PIECE_SYMBOLS[key] || '';
}

export default function BoardDiagram({
  fen,
  size = 400,
  orientation = 'white',
}: BoardDiagramProps) {
  const board = useMemo(() => {
    const setup = parseFen(fen);
    if (setup.isErr) {
      console.error('Invalid FEN:', fen);
      return null;
    }
    return setup.unwrap().board;
  }, [fen]);

  if (!board) {
    return null;
  }

  const squareSize = size / 8;
  const lightSquare = '#EEEED2';
  const darkSquare = '#769656';

  // Generate board squares and pieces
  const squares = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      // Adjust for orientation
      const displayRank = orientation === 'white' ? 7 - rank : rank;
      const displayFile = orientation === 'white' ? file : 7 - file;

      const x = displayFile * squareSize;
      const y = rank * squareSize;
      const isLight = (displayRank + displayFile) % 2 === 0;
      const squareColor = isLight ? lightSquare : darkSquare;

      // Get piece at this square (using actual board coordinates)
      const squareIndex = displayRank * 8 + displayFile;
      const piece = board.get(squareIndex);

      squares.push(
        <g key={`${displayRank}-${displayFile}`}>
          {/* Square */}
          <rect
            x={x}
            y={y}
            width={squareSize}
            height={squareSize}
            fill={squareColor}
          />
          {/* Piece */}
          {piece && (
            <text
              x={x + squareSize / 2}
              y={y + squareSize / 2}
              fontSize={squareSize * 0.7}
              textAnchor="middle"
              dominantBaseline="central"
              className={styles.piece}
            >
              {getPieceSymbol(piece)}
            </text>
          )}
        </g>
      );
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={styles.board}
    >
      {squares}
    </svg>
  );
}
