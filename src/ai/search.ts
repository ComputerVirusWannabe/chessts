import { type SquareType } from '../context/BoardContext';
import { type Player, type Move, getAllLegalMoves, applyMove, hashBoard } from './engine';
import { evaluate } from './evaluation';

type TTEntry = {
  depth: number;
  score: number;
};

export function chooseBestMove(
  board: SquareType[],
  player: Player,
  depth = 3
): Move | null {
  // TT is created locally so it is garbage-collected after each search,
  // preventing unbounded memory growth over a long game.
  const TT = new Map<number, TTEntry>();
  const { best } = minimax(board, depth, -Infinity, Infinity, player, TT);
  return best ?? null;
}

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

  if (tt && tt.depth >= depth) {
    return { score: tt.score };
  }

  if (depth === 0) {
    return { score: evaluate(board, player) };
  }

  const moves = getAllLegalMoves(board, player);

  if (moves.length === 0) {
    TT.set(key, { depth, score: -Infinity });
    return { score: -Infinity };
  }

  let bestMove: Move | undefined = moves[0];
  let bestScore = -Infinity;

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

  TT.set(key, { depth, score: bestScore });

  return { score: bestScore, best: bestMove };
}