import type { Move } from './engine';
import type { Player, SquareType } from '../types/chess';

export type AIWorkerRequest = {
  requestId: number;
  board: SquareType[];
  player: Player;
  maxDepth: number;
  maxTimeMs: number;
  enPassantSquare: number | null;
};

export type AIWorkerResponse = {
  requestId: number;
  move: Move | null;
};
