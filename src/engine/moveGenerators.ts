import type { PieceType, SquareType } from '../types/chess';

export const generateSlidingMoves = (
  directions: number[],
  pos: number,
  player: string,
  squares: SquareType[]
): number[] => {
  const moves: number[] = [];
  const row = Math.floor(pos / 8);
  const col = pos % 8;

  for (const dir of directions) {
    let target = pos + dir;

    while (target >= 0 && target < 64) {
      const targetRow = Math.floor(target / 8);
      const targetCol = target % 8;

      if ((dir === -1 || dir === 1) && targetRow !== row) {
        break;
      }

      if ((Math.abs(dir) === 7 || Math.abs(dir) === 9) && Math.abs(targetRow - row) !== Math.abs(targetCol - col)) {
        break;
      }

      const targetPiece = squares[target]?.piece;
      if (!targetPiece) {
        moves.push(target);
      } else {
        if (targetPiece.player !== player) {
          moves.push(target);
        }
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
  squares: SquareType[],
  enPassantSquare?: number
): number[] => {
  const moves: number[] = [];
  const player = piece.player!;

  switch (piece.name) {
    case 'pawn': {
      const dir = player === 'player1' ? -1 : 1;
      const row = Math.floor(pos / 8);
      const col = pos % 8;

      const forwardOne = pos + dir * 8;
      if (forwardOne >= 0 && forwardOne < 64 && !squares[forwardOne].piece) {
        moves.push(forwardOne);

        const startingRow = player === 'player1' ? 6 : 1;
        const forwardTwo = pos + dir * 16;
        if (row === startingRow && !squares[forwardTwo].piece) {
          moves.push(forwardTwo);
        }
      }

      for (const deltaColumn of [-1, 1]) {
        const targetCol = col + deltaColumn;
        const diagonal = pos + dir * 8 + deltaColumn;

        if (targetCol < 0 || targetCol >= 8 || diagonal < 0 || diagonal >= 64) {
          continue;
        }

        const targetPiece = squares[diagonal]?.piece;
        if (targetPiece && targetPiece.player !== player) {
          moves.push(diagonal);
        }

        const enPassantRow = player === 'player1' ? 3 : 4;
        if (row === enPassantRow && diagonal === enPassantSquare) {
          moves.push(diagonal);
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
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ];
      const row = Math.floor(pos / 8);
      const col = pos % 8;

      for (const [deltaRow, deltaColumn] of deltas) {
        const nextRow = row + deltaRow;
        const nextColumn = col + deltaColumn;
        if (nextRow < 0 || nextRow >= 8 || nextColumn < 0 || nextColumn >= 8) {
          continue;
        }

        const target = nextRow * 8 + nextColumn;
        const targetPiece = squares[target]?.piece;
        if (!targetPiece || targetPiece.player !== player) {
          moves.push(target);
        }
      }
      break;
    }

    case 'king': {
      const deltas = [-9, -8, -7, -1, 1, 7, 8, 9];
      const row = Math.floor(pos / 8);
      const col = pos % 8;

      for (const delta of deltas) {
        const target = pos + delta;
        if (target < 0 || target >= 64) {
          continue;
        }

        const targetRow = Math.floor(target / 8);
        const targetCol = target % 8;
        if (Math.abs(targetRow - row) > 1 || Math.abs(targetCol - col) > 1) {
          continue;
        }

        const targetPiece = squares[target]?.piece;
        if (!targetPiece || targetPiece.player !== player) {
          moves.push(target);
        }
      }
      break;
    }
  }

  return moves;
};
