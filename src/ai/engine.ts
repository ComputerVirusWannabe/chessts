import { type SquareType, type PieceType } from '../context/BoardContext';
import { generatePseudoLegalMoves } from '../engine/moveGenerators';
import * as Engine from '../engine/logic';

// Types
export type Player = 'player1' | 'player2';

export type Move = {
  from: number;
  to: number;
  promote?: 'queen' | 'rook' | 'bishop' | 'knight';
  isCapture?: boolean;
  isPromotion?: boolean;
};

const PIECES: PieceType['name'][] = ['pawn','knight','bishop','rook','queen','king'];
const COLORS: Player[] = ['player1','player2'];

// --------------------
// Move generation
// --------------------
export function getAllLegalMoves(
  board: SquareType[],
  player: Player,
  enPassantSquare?: number | null
): Move[] {
  const moves: Move[] = [];

  for (let i = 0; i < 64; i++) {
    const piece = board[i].piece;
    if (!piece || piece.player !== player) continue;

    const pseudo = generatePseudoLegalMoves(piece, i, board, enPassantSquare ?? undefined);
    const legal = Engine.filterLegalMoves(piece, i, pseudo, board);

    for (const to of legal) {
      const target = board[to].piece;

      const isCapture = !!target;

      const isPromotion =
        piece.name === 'pawn' &&
        ((player === 'player1' && to >= 0 && to <= 7) ||
         (player === 'player2' && to >= 56 && to <= 63));

      moves.push({
        from: i,
        to,
        isCapture,
        isPromotion,
        promote: isPromotion ? 'queen' : undefined,
      });
    }
  }

  return moves;
}

export function countMoves(board: SquareType[], player: Player): number {
  return getAllLegalMoves(board, player).length;
}

// --------------------
// Apply move
// --------------------
export function applyMove(board: SquareType[], mv: Move): SquareType[] {
  const next = board.map(sq => ({
    piece: sq.piece ? { ...sq.piece } : null
  }));

  const moving = next[mv.from].piece!;
  next[mv.to].piece = { ...moving, location: mv.to, hasMoved: true };
  next[mv.from].piece = null;

  if (mv.isPromotion) {
    next[mv.to].piece!.name = mv.promote ?? 'queen';
  }

  return next;
}

// --------------------
// Zobrist Hashing
// --------------------
const zobristTable: number[][][] = (() => {
  const rnd = () => (Math.random() * 0x100000000) >>> 0;
  const tbl: number[][][] = [];

  for (let sq = 0; sq < 64; sq++) {
    tbl[sq] = [];
    for (let p = 0; p < PIECES.length; p++) {
      tbl[sq][p] = [];
      for (let c = 0; c < COLORS.length; c++) {
        tbl[sq][p][c] = rnd();
      }
    }
  }

  return tbl;
})();

const SIDE_KEY = (Math.random() * 0x100000000) >>> 0;

function pieceIndex(name: PieceType['name']) {
  return PIECES.indexOf(name);
}
function colorIndex(color: Player) {
  return COLORS.indexOf(color);
}

export function hashBoard(board: SquareType[], sideToMove: Player): number {
  let h = 0 >>> 0;

  for (let i = 0; i < 64; i++) {
    const p = board[i].piece;
    if (!p) continue;

    const pi = pieceIndex(p.name);
    const ci = colorIndex(p.player);

    if (pi >= 0 && ci >= 0) {
      h ^= zobristTable[i][pi][ci];
    }
  }

  if (sideToMove === 'player1') h ^= SIDE_KEY;

  return h >>> 0;
}