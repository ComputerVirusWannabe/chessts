import { useContext } from 'react';
import { BoardContext, type PieceType } from '../context/BoardContext';
export const generateSlidingMoves = (
  directions: number[],
  pos: number,
  player: string,
  squares: { piece: PieceType | null }[]
): number[] => {
  const moves: number[] = [];
  const row = Math.floor(pos / 8);
  const col = pos % 8;

  for (const dir of directions) {
    let target = pos + dir;

    while (target >= 0 && target < 64) {
      const targetRow = Math.floor(target / 8);
      const targetCol = target % 8;

      if (dir === -1 || dir === 1) {
        if (targetRow !== row) break;
      }
      if (Math.abs(dir) === 7 || Math.abs(dir) === 9) {
        if (Math.abs(targetRow - row) !== Math.abs(targetCol - col)) break;
      }

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
  squares: { piece: PieceType | null }[],
  enPassantSquare?: number
): number[] => {
  const moves: number[] = [];
  const player = piece.player!;
  const name = piece.name;

  switch (name) {
    case 'pawn': {
      const dir = player === 'player1' ? -1 : 1;
      const row = Math.floor(pos / 8);
      const col = pos % 8;

      // Forward moves
      const forwardOne = pos + dir * 8;
      if (forwardOne >= 0 && forwardOne < 64 && !squares[forwardOne].piece) {
        moves.push(forwardOne);

        // Starting double move
        const startingRow = player === 'player1' ? 6 : 1;
        const forwardTwo = pos + dir * 16;
        if (row === startingRow && !squares[forwardTwo].piece) {
          moves.push(forwardTwo);
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const targetCol = col + dc;
        const diag = pos + dir * 8 + dc;
        if (targetCol >= 0 && targetCol < 8 && diag >= 0 && diag < 64) {
          const targetPiece = squares[diag]?.piece;
          if (targetPiece && targetPiece.player !== player) {
            moves.push(diag);
          }

          // En passant
          const enPassantRow = player === 'player1' ? 3 : 4; // fifth rank
          if (row === enPassantRow && diag === enPassantSquare) {
              moves.push(diag);
          }
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
