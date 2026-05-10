import { type Player, type SquareType } from '../types/chess';
import { isKingInCheck, opponent } from '../engine/logic';
import { type Move, getAllLegalMoves, applyMove, getNextEnPassantSquare, hashBoard } from './engine';
import { evaluate } from './evaluation';

type TTEntry = {
  depth: number;
  score: number;
  bestMove?: Move;
};

type SearchContext = {
  deadline: number;
};

type SearchResult = {
  score: number;
  best?: Move;
  timedOut?: boolean;
};

const ORDER_VALUE: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

const isTimeout = (ctx: SearchContext) => Date.now() >= ctx.deadline;

// Iterative deepening

export function chooseBestMove(
  board: SquareType[],
  player: Player,
  maxDepth = 5,
  maxTimeMs = 1000,
  enPassantSquare?: number | null
): Move | null {
  const TT = new Map<number, TTEntry>();

  const context: SearchContext = {
    deadline: maxTimeMs > 0 ? Date.now() + maxTimeMs : Infinity,
  };

  let bestMove: Move | null = null;

  for (let depth = 1; depth <= maxDepth; depth++) {
    if (isTimeout(context)) break;

    const result = minimax(
      board,
      depth,
      -Infinity,
      Infinity,
      player,
      enPassantSquare ?? null,
      TT,
      context
    );

    if (result.timedOut) break;

    if (result.best) {
      bestMove = result.best;
    }
  }

  return bestMove;
}

// Move ordering

function scoreMove(board: SquareType[], mv: Move): number {
  const moving = board[mv.from].piece;
  const target = board[mv.to].piece;

  if (!moving) return -Infinity;

  if (mv.isPromotion) return 10_000;

  if (mv.isCapture && target) {
    return ORDER_VALUE[target.name] * 10 - ORDER_VALUE[moving.name];
  }

  const file = mv.to % 8;
  const rank = Math.floor(mv.to / 8);
  const centerDist =
    Math.abs(3.5 - file) + Math.abs(3.5 - rank);

  return -centerDist;
}

// Quiescence search

function quiescence(
  board: SquareType[],
  alpha: number,
  beta: number,
  player: Player,
  enPassantSquare: number | null,
  ctx: SearchContext
): SearchResult {
  if (isTimeout(ctx)) {
    return {
      score: evaluate(board, player),
      timedOut: true,
    };
  }

  const standPat = evaluate(board, player);

  if (standPat >= beta) return { score: beta };
  if (standPat > alpha) alpha = standPat;

  const moves = getAllLegalMoves(board, player, enPassantSquare).filter(m => m.isCapture);

  for (const mv of moves) {
    if (isTimeout(ctx)) {
      return { score: standPat, timedOut: true };
    }

    const next = applyMove(board, mv);
    const nextEnPassantSquare = getNextEnPassantSquare(board, mv);

    const result = quiescence(
      next,
      -beta,
      -alpha,
      opponent(player),
      nextEnPassantSquare,
      ctx
    );

    const score = -result.score;

    if (score >= beta) return { score: beta };
    if (score > alpha) alpha = score;
  }

  return { score: alpha };
}


// Minimax

function minimax(
  board: SquareType[],
  depth: number,
  alpha: number,
  beta: number,
  player: Player,
  enPassantSquare: number | null,
  TT: Map<number, TTEntry>,
  ctx: SearchContext
): SearchResult {
  if (isTimeout(ctx)) {
    return {
      score: evaluate(board, player),
      timedOut: true,
    };
  }

  const key = hashBoard(board, player, enPassantSquare);
  const tt = TT.get(key);

  if (tt && tt.depth >= depth) {
    return {
      score: tt.score,
      best: tt.bestMove,
    };
  }

  if (depth === 0) {
    return quiescence(board, alpha, beta, player, enPassantSquare, ctx);
  }

  const moves = getAllLegalMoves(board, player, enPassantSquare);

  if (moves.length === 0) {
    return { score: isKingInCheck(player, board) ? -Infinity : 0 };
  }

  let bestMove: Move | undefined;
  let bestScore = -Infinity;

  // Move ordering
  moves.sort((a, b) => scoreMove(board, b) - scoreMove(board, a));

  for (const mv of moves) {
    if (isTimeout(ctx)) {
      return {
        score: bestScore === -Infinity ? evaluate(board, player) : bestScore,
        best: bestMove,
        timedOut: true,
      };
    }

    const next = applyMove(board, mv);
    const nextEnPassantSquare = getNextEnPassantSquare(board, mv);

    const result = minimax(
      next,
      depth - 1,
      -beta,
      -alpha,
      opponent(player),
      nextEnPassantSquare,
      TT,
      ctx
    );

    if (result.timedOut) {
      return {
        score: bestScore === -Infinity ? evaluate(board, player) : bestScore,
        best: bestMove,
        timedOut: true,
      };
    }

    const score = -result.score;

    if (score > bestScore) {
      bestScore = score;
      bestMove = mv;
    }

    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }

  TT.set(key, {
    depth,
    score: bestScore,
    bestMove,
  });

  return {
    score: bestScore,
    best: bestMove,
  };
}
