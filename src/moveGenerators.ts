import { type PieceType } from './context/BoardContext';

export const generateSlidingMoves = (
  directions: number[],
  pos: number,
  player: string,
  squares: { piece: PieceType | null }[]
): number[] => {
  const moves: number[] = [];
  for (const dir of directions) {
    let target = pos + dir;
    while (target >= 0 && target < 64) {
      const tr = Math.floor(target / 8);
      const tc = target % 8;
      const pr = Math.floor((target - dir) / 8);
      const pc = (target - dir) % 8;

      // break if wrapped to a new row incorrectly
      if (Math.abs(tr - pr) > 1 || Math.abs(tc - pc) > 1) break;

      const targetPiece = squares[target]?.piece;
      if (!targetPiece) {
        moves.push(target);
      } else {
        if (targetPiece.player !== player) moves.push(target);
        break;
      }

      target += dir;
    }
  }
  return moves;
};

export const generatePseudoLegalMoves = (
  piece: PieceType,
  pos: number,
  squares: { piece: PieceType | null }[]
): number[] => {
  const player = piece.player!;
  const name = piece.name.toLowerCase();
  const moves: number[] = [];

  switch (name) {
    case 'pawn': {
      const dir = player === 'player1' ? -1 : 1;
      const row = Math.floor(pos / 8);
      const col = pos % 8;
    
      const forwardOne = pos + dir * 8;
      // Move 1 square forward if empty
      if (forwardOne >= 0 && forwardOne < 64 && !squares[forwardOne].piece) {
        moves.push(forwardOne);
    
        // Move 2 squares forward if first move and path is clear
        const startingRow = player === 'player1' ? 6 : 1;
        const forwardTwo = pos + dir * 16;
        if (row === startingRow && !squares[forwardTwo].piece) {
          moves.push(forwardTwo);
        }
      }
    
      // Captures
      for (const dc of [-1, 1]) {
        const targetCol = col + dc;
        const diag = pos + dir * 8 + dc;
        if (targetCol >= 0 && targetCol < 8 && diag >= 0 && diag < 64) {
          const targetPiece = squares[diag]?.piece;
          if (targetPiece && targetPiece.player !== player) moves.push(diag);
        }
      }
      break;
    }
    

    case 'rook':
      moves.push(...generateSlidingMoves([-8, 8, -1, 1], pos, player, squares));
      break;

    case 'bishop':
      moves.push(...generateSlidingMoves([-9, -7, 7, 9], pos, player, squares));
      break;

    case 'queen':
      moves.push(...generateSlidingMoves([-8, 8, -1, 1, -9, -7, 7, 9], pos, player, squares));
      break;

    case 'knight': {
      const deltas = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2],
      ];
      const r = Math.floor(pos / 8);
      const c = pos % 8;
      for (const [dr, dc] of deltas) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = nr * 8 + nc;
          const targetPiece = squares[target]?.piece;
          if (!targetPiece || targetPiece.player !== player) moves.push(target);
        }
      }
      break;
    }

    case 'king': {
      const deltas = [-9, -8, -7, -1, 1, 7, 8, 9];
      const kr = Math.floor(pos / 8);
      const kc = pos % 8;
      for (const delta of deltas) {
        const target = pos + delta;
        if (target < 0 || target >= 64) continue;
        const tr = Math.floor(target / 8);
        const tc = target % 8;
        if (Math.abs(tr - kr) > 1 || Math.abs(tc - kc) > 1) continue;
        const targetPiece = squares[target]?.piece;
        if (!targetPiece || targetPiece.player !== player) moves.push(target);
      }
      break;
    }
  }

  return moves;
};

export const isSquareAttacked = (
  square: number,
  byPlayer: string,
  squares: { piece?: PieceType }[]
): boolean => {
  for (let i = 0; i < 64; i++) {
    const piece = squares[i]?.piece;
    if (piece && piece.player === byPlayer) {
      const moves = generatePseudoLegalMoves(piece, i, squares as { piece: PieceType | null }[]);
      if (moves.includes(square)) {
        return true;
      }
    }
  }
  return false;
};