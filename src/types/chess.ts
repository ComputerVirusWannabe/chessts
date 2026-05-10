export type Player = 'player1' | 'player2';

export type PieceName = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

export type PromotionPieceName = 'queen' | 'rook' | 'bishop' | 'knight';

export type GameMode = 'human-vs-human' | 'human-vs-ai' | null;
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type PieceType = {
  id: string;
  name: PieceName;
  color: string;
  player: Player | null;
  capturedBy?: Player;
  location: number;
  hasMoved?: boolean;
};

export type SquareType = {
  piece: PieceType | null;
};

export type LastMove = {
  from: number;
  to: number;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PromotionPieceName;
  isEnPassant?: boolean;
  isCastling?: boolean;
  san?: string;
};

export type LegalMove = {
  from: number;
  to: number;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PromotionPieceName;
  isEnPassant: boolean;
  isCastling: boolean;
  san?: string;
};

export type MoveHistoryEntry = {
  moveNumber: number;
  player: Player;
  piece: PieceName;
  from: number;
  to: number;
  san: string;
  capturedPiece?: PieceName;
  promotion?: PromotionPieceName;
  fen: string;
};

export type GameSnapshot = {
  squares: SquareType[];
  capturedPieces: PieceType[];
  currentTurn: Player;
  enPassantSquare: number | null;
  lastMove: LastMove | null;
  kingInCheckSquare: number | null;
  moveHistory: MoveHistoryEntry[];
};
