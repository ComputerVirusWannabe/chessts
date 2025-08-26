// ai.ts
import { type SquareType, type PieceType } from '../context/BoardContext';
import { generatePseudoLegalMoves } from '../engine/moveGenerators';
import * as Engine from '../engine/logic';

// -----------------------------
// Types
// -----------------------------
export type Player = 'player1' | 'player2';

export type Move = {
  from: number;
  to: number;
  // Search will assume queen promotion by default (best choice for material).
  promote?: 'queen' | 'rook' | 'bishop' | 'knight';
  // Optional flags (helpful for ordering / quiescence)
  isCapture?: boolean;
  isPromotion?: boolean;
  isCheck?: boolean;
};

// -----------------------------
// Basic evaluation
// -----------------------------
const PIECE_VALUE: Record<PieceType['name'], number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20_000, // high but finite for search stability
};

function materialScore(board: SquareType[], forPlayer: Player): number {
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = board[i].piece;
    if (!p) continue;
    const s = (PIECE_VALUE[p.name] ?? 0);
    score += p.player === forPlayer ? s : -s;
  }
  return score;
}

function evaluate(board: SquareType[], sideToMove: Player): number {
  // Simple: material + tiny mobility bonus
  const base = materialScore(board, sideToMove);
  const mobility = countMoves(board, sideToMove) - countMoves(board, Engine.opponent(sideToMove));
  return base + 5 * mobility;
}

// -----------------------------
// Legal move generation wrapper
// -----------------------------
function getAllLegalMoves(
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
      const willPromote =
        piece.name === 'pawn' &&
        ((player === 'player1' && to >= 0 && to <= 7) ||
         (player === 'player2' && to >= 56 && to <= 63));

      // (search default: auto-queen; UI will still ask the user in real play)
      moves.push({
        from: i,
        to,
        isCapture,
        isPromotion: willPromote,
        promote: willPromote ? 'queen' : undefined,
      });
    }
  }

  // basic ordering: promotions, captures, checks first (checks computed later cheaply)
  moves.sort((a, b) => {
    const ap = (a.isPromotion ? 2 : 0) + (a.isCapture ? 1 : 0);
    const bp = (b.isPromotion ? 2 : 0) + (b.isCapture ? 1 : 0);
    return bp - ap;
  });

  return moves;
}

function countMoves(board: SquareType[], player: Player): number {
  return getAllLegalMoves(board, player).length;
}

// -----------------------------
// Immutable apply move (engine-side)
// -----------------------------
function applyMove(board: SquareType[], mv: Move): SquareType[] {
  const next = board.map(sq => ({ piece: sq.piece ? { ...sq.piece } : null }));

  const moving = next[mv.from].piece!;
  // move piece
  next[mv.to].piece = { ...moving, location: mv.to, hasMoved: true };
  next[mv.from].piece = null;

  // promotion (search side -> auto queen unless specified)
  if (mv.isPromotion) {
    const promoted = mv.promote ?? 'queen';
    const p = next[mv.to].piece!;
    next[mv.to].piece = {
      ...p,
      name: promoted,
    };
  }

  // castling is optional here; if you already allow king's two-square moves in generators,
  // you can mirror your castling rook shift logic here if desired.
  // (Omitted for brevity; not required for a working first pass.)

  // en passant (optional to add here if your generator emits EP squares)
  // same note as above.

  return next;
}

// -----------------------------
// Zobrist hashing (minimal)
// -----------------------------
const PIECES: Array<PieceType['name']> = ['pawn','knight','bishop','rook','queen','king'];
const COLORS: Array<Player> = ['player1','player2'];

const zobristTable: number[][][] = (() => {
  // [square][pieceIndex][colorIndex] -> random 32-bit int
  const rnd = () => (Math.random() * 0x100000000) >>> 0;
  const tbl: number[][][] = new Array(64);
  for (let sq = 0; sq < 64; sq++) {
    tbl[sq] = new Array(PIECES.length);
    for (let p = 0; p < PIECES.length; p++) {
      tbl[sq][p] = new Array(COLORS.length);
      for (let c = 0; c < COLORS.length; c++) tbl[sq][p][c] = rnd();
    }
  }
  return tbl;
})();

const SIDE_TO_MOVE_KEY = (() => (Math.random() * 0x100000000) >>> 0)();

function pieceIndex(name: PieceType['name']) {
  return PIECES.indexOf(name);
}
function colorIndex(color: Player) {
  return COLORS.indexOf(color);
}

function hashBoard(board: SquareType[], sideToMove: Player): number {
  let h = 0 >>> 0;
  for (let i = 0; i < 64; i++) {
    const p = board[i].piece;
    if (!p || !p.player) continue;
    const pi = pieceIndex(p.name);
    const ci = colorIndex(p.player);
    if (pi >= 0 && ci >= 0) {
      h ^= zobristTable[i][pi][ci];
    }
  }
  if (sideToMove === 'player1') h ^= SIDE_TO_MOVE_KEY;
  return h >>> 0;
}

// -----------------------------
// Transposition table
// -----------------------------
type TTFlag = 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND';
type TTEntry = {
  key: number;
  depth: number;
  score: number;
  flag: TTFlag;
  best?: Move;
};

const TT = new Map<number, TTEntry>();

// -----------------------------
// Quiescence search (captures/promotions only)
// -----------------------------
function isQuiet(board: SquareType[], player: Player): boolean {
  // If any capture is available, not quiet
  const moves = getAllLegalMoves(board, player);
  return !moves.some(m => m.isCapture || m.isPromotion);
}

function quiescence(
  board: SquareType[],
  alpha: number,
  beta: number,
  player: Player
): number {
  // stand-pat evaluation
  let standPat = evaluate(board, player);

  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;

  // Only explore "noisy" moves
  const moves = getAllLegalMoves(board, player).filter(m => m.isCapture || m.isPromotion);

  for (const mv of moves) {
    const next = applyMove(board, mv);
    const score = -quiescence(next, -beta, -alpha, Engine.opponent(player));
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

// -----------------------------
// Minimax with alpha-beta + TT
// -----------------------------
function minimax(
  board: SquareType[],
  depth: number,
  alpha: number,
  beta: number,
  player: Player
): { score: number; best?: Move } {
  const key = hashBoard(board, player);
  const tt = TT.get(key);
  if (tt && tt.depth >= depth) {
    // TT cutoff
    if (tt.flag === 'EXACT') return { score: tt.score, best: tt.best };
    if (tt.flag === 'LOWERBOUND' && tt.score > alpha) alpha = tt.score;
    else if (tt.flag === 'UPPERBOUND' && tt.score < beta) beta = tt.score;
    if (alpha >= beta) return { score: tt.score, best: tt.best };
  }

  // terminal checks
  if (Engine.isCheckmate(player, board)) return { score: -30_000, best: undefined };
  if (Engine.isStalemate(player, board) || depth === 0) {
    return { score: quiescence(board, alpha, beta, player), best: undefined };
  }

  let bestMove: Move | undefined;
  let value = -Infinity;

  // ordered moves
  const moves = getAllLegalMoves(board, player);

  // optional: shallow check tagging for ordering (cheap)
  // you can set mv.isCheck by quick probe if you want, omitted for brevity.

  for (const mv of moves) {
    const next = applyMove(board, mv);
    const child = minimax(next, depth - 1, -beta, -alpha, Engine.opponent(player));
    const score = -child.score;

    if (score > value) {
      value = score;
      bestMove = mv;
      if (score > alpha) alpha = score;
      if (alpha >= beta) break; // prune
    }
  }

  // store in TT
  let flag: TTFlag = 'EXACT';
  if (value <= alpha) flag = 'UPPERBOUND';
  else if (value >= beta) flag = 'LOWERBOUND';

  TT.set(key, { key, depth, score: value, flag, best: bestMove });

  return { score: value, best: bestMove };
}

// -----------------------------
// Public entry: chooseBestMove
// -----------------------------
export function chooseBestMove(
  board: SquareType[],
  player: Player,
  options?: {
    depth?: number;              // search depth (plies)
    enPassantSquare?: number | null;
    // (you can add time controls etc. later)
  }
): Move | null {
  const depth = options?.depth ?? 3;

  // clear/keep TT as you wish (keeping helps iterative deepening)
  // TT.clear();

  const { best } = minimax(board, depth, -Infinity, Infinity, player);
  return best ?? null;
}
