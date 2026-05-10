import { type Player, type SquareType } from '../types/chess';
import { type Move, getAllLegalMoves, applyMove, hashBoard } from './engine';
import { evaluate } from './evaluation';

type TTEntry = {
  depth: number;
  score: number;
  bestMove?: Move;
};

const ORDER_VALUE: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// Iterative Deepening 
export function chooseBestMove(
  board: SquareType[],
  player: Player,
  maxDepth = 4
): Move | null {
  const TT = new Map<number, TTEntry>();

  let bestMove: Move | null = null;

  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = minimax(
      board,
      depth,
      -Infinity,
      Infinity,
      player,
      TT
    );

    if (result.best) {
      bestMove = result.best;
    }
  }

  return bestMove;
}


// Move ordering heuristic
function scoreMove(board: SquareType[], mv: Move): number {
  const moving = board[mv.from].piece;
  const target = board[mv.to].piece;

  if (!moving) return -Infinity;

  if (mv.isPromotion) return 10_000;

  if (mv.isCapture && target) {
    return ORDER_VALUE[target.name] * 10 - ORDER_VALUE[moving.name];
  }

  // center bias
  const file = mv.to % 8;
  const rank = Math.floor(mv.to / 8);
  const centerDist =
    Math.abs(3.5 - file) + Math.abs(3.5 - rank);

  return -centerDist;
}

// Quiescence Search
function quiescence(
  board: SquareType[],
  alpha: number,
  beta: number,
  player: Player
) {
  let standPat = evaluate(board, player);

  if (standPat >= beta) return { score: beta };
  if (standPat > alpha) alpha = standPat;

  const moves = getAllLegalMoves(board, player).filter(m => m.isCapture);

  for (const mv of moves) {
    const next = applyMove(board, mv);
    const score =
      -quiescence(
        next,
        -beta,
        -alpha,
        player === 'player1' ? 'player2' : 'player1'
      ).score;

    if (score >= beta) return { score: beta };
    if (score > alpha) alpha = score;
  }

  return { score: alpha };
}

// Minimax + Alpha Beta
function minimax(
  board: SquareType[],
  depth: number,
  alpha: number,
  beta: number,
  player: Player,
  TT: Map<number, TTEntry>
): { score: number; best?: Move } {
  const key = hashBoard(board, player);
  const tt = TT.get(key);

  // TT cutoff (correct + complete)
  if (tt && tt.depth >= depth) {
    return {
      score: tt.score,
      best: tt.bestMove,
    };
  }

  if (depth === 0) {
    return quiescence(board, alpha, beta, player);
  }

  const moves = getAllLegalMoves(board, player);

  if (moves.length === 0) {
    return { score: -Infinity };
  }

  let bestMove: Move | undefined;
  let bestScore = -Infinity;

  
  // Move ordering
  moves.sort((a, b) => {
    const ttMove = tt?.bestMove;

    if (ttMove) {
      if (a.from === ttMove.from && a.to === ttMove.to) return -1;
      if (b.from === ttMove.from && b.to === ttMove.to) return 1;
    }

    return scoreMove(board, b) - scoreMove(board, a);
  });

  // Search
  for (const mv of moves) {
    const next = applyMove(board, mv);

    const result = minimax(
      next,
      depth - 1,
      -beta,
      -alpha,
      player === 'player1' ? 'player2' : 'player1',
      TT
    );

    const score = -result.score;

    if (score > bestScore) {
      bestScore = score;
      bestMove = mv;
    }

    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }


  // Store TT
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