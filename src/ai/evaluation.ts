import { type PieceType, type Player, type SquareType } from '../types/chess';
import { countMoves } from './engine';

const PIECE_VALUE: Record<PieceType['name'], number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

const PAWN_TABLE = [
   0, 0, 0, 0, 0, 0, 0, 0,
  50,50,50,50,50,50,50,50,
  10,10,20,30,30,20,10,10,
   5, 5,10,25,25,10, 5, 5,
   0, 0, 0,20,20, 0, 0, 0,
   5,-5,-10,0,0,-10,-5, 5,
   5,10,10,-20,-20,10,10, 5,
   0, 0, 0, 0, 0, 0, 0, 0
];

function mirror(square: number): number {
  const row = Math.floor(square / 8);
  const col = square % 8;
  return (7 - row) * 8 + col;
}

function pieceSquareBonus(piece: PieceType, square: number): number {
  const idx = piece.player === 'player2' ? mirror(square) : square;

  switch (piece.name) {
    case 'pawn': return PAWN_TABLE[idx];
    default: return 0;
  }
}

export function evaluate(board: SquareType[], forPlayer: Player): number {
  let score = 0;

  let mobilityBonus = 0;
  let kingSafetyPenalty = 0;

  const enemy = forPlayer === 'player1' ? 'player2' : 'player1';

  for (let i = 0; i < 64; i++) {
    const p = board[i].piece;
    if (!p) continue;

    const val = PIECE_VALUE[p.name];

    // material
    score += p.player === forPlayer ? val : -val;

    // positional
    score += pieceSquareBonus(p, i);
  }

  // mobility (done once, not per piece)
  mobilityBonus =
    countMoves(board, forPlayer) -
    countMoves(board, enemy);

  score += 5 * mobilityBonus;

  // king safety (now correct placement)
  const enemyMoves = countMoves(board, enemy);
  kingSafetyPenalty = enemyMoves * 2;

  score -= kingSafetyPenalty;

  return score;
}
