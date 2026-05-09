import type { PieceName } from '../types/chess';

export const pieceSymbolsBlack: Record<PieceName, string> = {
  pawn: '♟',
  rook: '♜',
  knight: '♞',
  bishop: '♝',
  queen: '♛',
  king: '♚',
};

export const pieceSymbolsWhite: Record<PieceName, string> = {
  pawn: '♙',
  rook: '♖',
  knight: '♘',
  bishop: '♗',
  queen: '♕',
  king: '♔',
};
