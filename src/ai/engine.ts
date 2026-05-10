import { type PieceType, type Player, type PromotionPieceName, type SquareType } from '../types/chess';
import { generatePseudoLegalMoves } from '../engine/moveGenerators';
import * as Engine from '../engine/logic';
import { calculateCastlingMoves } from '../engine/logic';

export type Move = {
  from: number;
  to: number;
  promote?: PromotionPieceName;
  isCapture?: boolean;
  isPromotion?: boolean;
  isEnPassant?: boolean;
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

    if (piece.name === 'king' && !piece.hasMoved) {
      pseudo.push(...calculateCastlingMoves(piece, board));
    }

    const legal = Engine.filterLegalMoves(piece, i, pseudo, board, enPassantSquare ?? undefined);

    for (const to of legal) {
      const target = board[to].piece;
      const isEnPassant =
        piece.name === 'pawn' &&
        enPassantSquare != null &&
        to === enPassantSquare &&
        !target;

      const isCapture = !!target || isEnPassant;

      const isPromotion =
        piece.name === 'pawn' &&
        ((player === 'player1' && to >= 0 && to <= 7) ||
         (player === 'player2' && to >= 56 && to <= 63));

      moves.push({
        from: i,
        to,
        isCapture,
        isPromotion,
        isEnPassant,
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

  if (mv.isEnPassant) {
    const capturedIndex = moving.player === 'player1' ? mv.to + 8 : mv.to - 8;
    next[capturedIndex].piece = null;
  }

  if (mv.isPromotion) {
    next[mv.to].piece!.name = mv.promote ?? 'queen';
  }

  // Handle castling: move the rook along with the king
  if (moving.name === 'king' && Math.abs(mv.to - mv.from) === 2) {
    const row = Math.floor(mv.from / 8);
    if (mv.to > mv.from) { // kingside
      const rookFrom = row * 8 + 7;
      const rookTo = row * 8 + 5;
      if (next[rookFrom].piece) {
        next[rookTo].piece = { ...next[rookFrom].piece!, location: rookTo, hasMoved: true };
        next[rookFrom].piece = null;
      }
    } else { // queenside
      const rookFrom = row * 8 + 0;
      const rookTo = row * 8 + 3;
      if (next[rookFrom].piece) {
        next[rookTo].piece = { ...next[rookFrom].piece!, location: rookTo, hasMoved: true };
        next[rookFrom].piece = null;
      }
    }
  }

  return next;
}

export function getNextEnPassantSquare(board: SquareType[], mv: Move): number | null {
  const moving = board[mv.from].piece;
  if (!moving || moving.name !== 'pawn') {
    return null;
  }

  return Math.abs(mv.to - mv.from) === 16 ? (mv.from + mv.to) / 2 : null;
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
const EP_FILE_KEYS = Array.from({ length: 8 }, () => (Math.random() * 0x100000000) >>> 0);

function pieceIndex(name: PieceType['name']) {
  return PIECES.indexOf(name);
}
function colorIndex(color: Player) {
  return COLORS.indexOf(color);
}

export function hashBoard(
  board: SquareType[],
  sideToMove: Player,
  enPassantSquare?: number | null
): number {
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
  if (enPassantSquare != null) {
    h ^= EP_FILE_KEYS[enPassantSquare % 8];
  }

  return h >>> 0;
}
