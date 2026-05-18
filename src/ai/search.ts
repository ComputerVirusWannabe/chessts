import { type GameSnapshot, type LegalMove, type Player, type SquareType } from '../types/chess';
import { hashBoard } from './engine';
import { evaluate } from './evaluation';
import { applyLegalMove, getLegalMoves } from '../engine/game';
import { getBookMove } from './book';
import { isSquareAttacked, opponent } from '../engine/logic';

type TTEntry = {
  depth: number;
  score: number;
  bestMove?: LegalMove;
};

const ORDER_VALUE: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

export type BestMoveResult = {
  move: LegalMove;
  opening?: string;
  fromBook: boolean;
};

const hashSnapshot = (snapshot: GameSnapshot): string => {
  const boardState = snapshot.squares
    .map(square => {
      const piece = square.piece;
      if (!piece || !piece.player) {
        return '_';
      }
      return `${piece.player}:${piece.name}:${piece.hasMoved ? 1 : 0}`;
    })
    .join('|');
  const baseHash = hashBoard(snapshot.squares, snapshot.currentTurn);
  return `${baseHash}:${snapshot.currentTurn}:${snapshot.enPassantSquare ?? '-'}:${boardState}`;
};

const isCurrentPlayerInCheck = (snapshot: GameSnapshot): boolean => {
  const kingSquare = snapshot.squares.findIndex(
    square => square.piece?.player === snapshot.currentTurn && square.piece.name === 'king'
  );

  if (kingSquare < 0) {
    return false;
  }

  return isSquareAttacked(kingSquare, opponent(snapshot.currentTurn), snapshot.squares);
};

// Iterative Deepening
export function chooseBestMove(snapshot: GameSnapshot, maxDepth = 4): BestMoveResult | null {
  const bookEntry = getBookMove(snapshot);
  if (bookEntry) {
    return {
      move: bookEntry.move,
      opening: bookEntry.opening,
      fromBook: true,
    };
  }

  const TT = new Map<string, TTEntry>();
  let bestMove: LegalMove | null = null;

  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = minimax(
      snapshot,
      depth,
      -Infinity,
      Infinity,
      TT
    );

    if (result.best) {
      bestMove = result.best;
    }
  }

  if (!bestMove) {
    return null;
  }

  return {
    move: bestMove,
    fromBook: false,
  };
}


// Move ordering heuristic
function scoreMove(board: SquareType[], mv: LegalMove): number {
  const moving = board[mv.from].piece;
  const target = mv.captured ?? board[mv.to].piece;

  if (!moving) return -Infinity;

  if (mv.promotion) return 10_000;

  if (target) {
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
  snapshot: GameSnapshot,
  alpha: number,
  beta: number
) {
  const standPat = evaluate(snapshot.squares, snapshot.currentTurn);

  if (standPat >= beta) return { score: beta };
  if (standPat > alpha) alpha = standPat;

  const moves = getLegalMoves(snapshot.squares, snapshot.currentTurn, snapshot.enPassantSquare).filter(
    move => Boolean(move.captured)
  );

  for (const mv of moves) {
    const { snapshot: nextSnapshot } = applyLegalMove(snapshot, mv, moves);
    const score =
      -quiescence(
        nextSnapshot,
        -beta,
        -alpha
      ).score;

    if (score >= beta) return { score: beta };
    if (score > alpha) alpha = score;
  }

  return { score: alpha };
}

// Minimax + Alpha Beta
function minimax(
  snapshot: GameSnapshot,
  depth: number,
  alpha: number,
  beta: number,
  TT: Map<string, TTEntry>
): { score: number; best?: LegalMove } {
  const key = hashSnapshot(snapshot);
  const tt = TT.get(key);

  // TT cutoff (correct + complete)
  if (tt && tt.depth >= depth) {
    return {
      score: tt.score,
      best: tt.bestMove,
    };
  }

  if (depth === 0) {
    return quiescence(snapshot, alpha, beta);
  }

  const moves = getLegalMoves(snapshot.squares, snapshot.currentTurn, snapshot.enPassantSquare);

  if (moves.length === 0) {
    return { score: isCurrentPlayerInCheck(snapshot) ? -Infinity : 0 };
  }

  let bestMove: LegalMove | undefined;
  let bestScore = -Infinity;

  
  // Move ordering
  moves.sort((a, b) => {
    const ttMove = tt?.bestMove;

      if (ttMove) {
        const sameAsA = a.from === ttMove.from && a.to === ttMove.to && a.promotion === ttMove.promotion;
        const sameAsB = b.from === ttMove.from && b.to === ttMove.to && b.promotion === ttMove.promotion;
        if (sameAsA) return -1;
        if (sameAsB) return 1;
      }

      return scoreMove(snapshot.squares, b) - scoreMove(snapshot.squares, a);
  });

  // Search
  for (const mv of moves) {
    const { snapshot: nextSnapshot } = applyLegalMove(snapshot, mv, moves);

    const result = minimax(
      nextSnapshot,
      depth - 1,
      -beta,
      -alpha,
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
