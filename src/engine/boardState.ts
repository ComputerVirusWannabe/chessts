import { v4 as uuidv4 } from 'uuid';
import type {
  GameSnapshot,
  LastMove,
  MoveHistoryEntry,
  PieceName,
  PieceType,
  Player,
  SquareType,
} from '../types/chess';

const PLAYER_COLORS: Record<Player, string> = {
  player1: 'white',
  player2: 'brown',
};

export const createPiece = (
  name: PieceName,
  player: Player,
  location: number,
  overrides: Partial<PieceType> = {}
): PieceType => ({
  id: uuidv4(),
  name,
  color: PLAYER_COLORS[player],
  player,
  location,
  ...overrides,
});

export const createInitialSquares = (): SquareType[] => {
  const squares: SquareType[] = Array.from({ length: 64 }, () => ({ piece: null }));

  for (let i = 0; i < 8; i++) {
    squares[8 + i].piece = createPiece('pawn', 'player2', 8 + i);
    squares[48 + i].piece = createPiece('pawn', 'player1', 48 + i);
  }

  squares[0].piece = createPiece('rook', 'player2', 0);
  squares[7].piece = createPiece('rook', 'player2', 7);
  squares[1].piece = createPiece('knight', 'player2', 1);
  squares[6].piece = createPiece('knight', 'player2', 6);
  squares[2].piece = createPiece('bishop', 'player2', 2);
  squares[5].piece = createPiece('bishop', 'player2', 5);
  squares[3].piece = createPiece('queen', 'player2', 3);
  squares[4].piece = createPiece('king', 'player2', 4);

  squares[56].piece = createPiece('rook', 'player1', 56);
  squares[63].piece = createPiece('rook', 'player1', 63);
  squares[57].piece = createPiece('knight', 'player1', 57);
  squares[62].piece = createPiece('knight', 'player1', 62);
  squares[58].piece = createPiece('bishop', 'player1', 58);
  squares[61].piece = createPiece('bishop', 'player1', 61);
  squares[59].piece = createPiece('queen', 'player1', 59);
  squares[60].piece = createPiece('king', 'player1', 60);

  return squares;
};

export const clonePiece = (piece: PieceType | null): PieceType | null =>
  piece ? { ...piece } : null;

export const cloneSquares = (squares: SquareType[]): SquareType[] =>
  squares.map(square => ({ piece: clonePiece(square.piece) }));

export const cloneCapturedPieces = (capturedPieces: PieceType[]): PieceType[] =>
  capturedPieces.map(piece => ({ ...piece }));

export const cloneLastMove = (lastMove: LastMove | null): LastMove | null =>
  lastMove
    ? {
        ...lastMove,
        piece: { ...lastMove.piece },
        captured: lastMove.captured ? { ...lastMove.captured } : undefined,
      }
    : null;

export const cloneMoveHistory = (moveHistory: MoveHistoryEntry[]): MoveHistoryEntry[] =>
  moveHistory.map(entry => ({ ...entry }));

export const cloneGameSnapshot = (snapshot: GameSnapshot): GameSnapshot => ({
  squares: cloneSquares(snapshot.squares),
  capturedPieces: cloneCapturedPieces(snapshot.capturedPieces),
  currentTurn: snapshot.currentTurn,
  enPassantSquare: snapshot.enPassantSquare,
  lastMove: cloneLastMove(snapshot.lastMove),
  kingInCheckSquare: snapshot.kingInCheckSquare,
  moveHistory: cloneMoveHistory(snapshot.moveHistory),
});

export const createInitialGameSnapshot = (): GameSnapshot => ({
  squares: createInitialSquares(),
  capturedPieces: [],
  currentTurn: 'player1',
  enPassantSquare: null,
  lastMove: null,
  kingInCheckSquare: null,
  moveHistory: [],
});
