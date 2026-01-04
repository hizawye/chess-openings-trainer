export type BoardTheme = 'green' | 'brown' | 'blue' | 'purple';
export type PieceStyle = 'cburnett' | 'merida' | 'alpha' | 'chess7';

export interface Settings {
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
  soundEnabled: boolean;
  showCoordinates: boolean;
  showLegalMoves: boolean;
  showMoveArrows: boolean;
  autoPlayOpponentMoves: boolean;
  autoPlayDelay: number; // milliseconds
}

export const defaultSettings: Settings = {
  boardTheme: 'green',
  pieceStyle: 'cburnett',
  soundEnabled: true,
  showCoordinates: true,
  showLegalMoves: true,
  showMoveArrows: true,
  autoPlayOpponentMoves: true,
  autoPlayDelay: 500,
};
