import type { LastMove, PieceType, Player, SquareType } from '../types/chess';
import { generatePseudoLegalMoves } from './moveGenerators';

type FenMove = {
  from: number;
  to: number;
};

export const opponent = (player: Player): Player => (player === 'player1' ? 'player2' : 'player1');

export const isSquareAttacked = (
  square: number,
  byPlayer: Player,
  board: SquareType[]
): boolean => {
  for (let index = 0; index < 64; index++) {
    const piece = board[index]?.piece;
    if (!piece || piece.player !== byPlayer) {
      continue;
    }

    const moves = generatePseudoLegalMoves(piece, index, board);
    if (moves.includes(square)) {
      return true;
    }
  }

  return false;
};

export const calculateCastlingMoves = (piece: PieceType, board: SquareType[]): number[] => {
  const moves: number[] = [];
  const { location, player, hasMoved } = piece;

  if (!player || hasMoved || piece.name !== 'king') {
    return moves;
  }

  const row = Math.floor(location / 8);
  const opponentPlayer = opponent(player);
  const rooks = board
    .map((square, index) => ({ square, index }))
    .filter(
      ({ square, index }) =>
        square.piece?.player === player &&
        square.piece.name === 'rook' &&
        !square.piece.hasMoved &&
        Math.floor(index / 8) === row
    );

  for (const { index } of rooks) {
    const direction = index > location ? 1 : -1;
    const pathIndices: number[] = [];

    for (let cursor = location + direction; cursor !== index; cursor += direction) {
      pathIndices.push(cursor);
    }

    if (
      pathIndices.every(pathIndex => !board[pathIndex].piece) &&
      pathIndices.every(pathIndex => !isSquareAttacked(pathIndex, opponentPlayer, board))
    ) {
      moves.push(location + 2 * direction);
    }
  }

  return moves;
};

export const filterLegalMoves = (
  piece: PieceType,
  fromIndex: number,
  pseudoMoves: number[],
  squares: SquareType[],
  enPassantSquare?: number
): number[] =>
  pseudoMoves.filter(toIndex => {
    const tempBoard = squares.map(square => ({ piece: square.piece ? { ...square.piece } : null }));
    if (
      !Number.isInteger(fromIndex) ||
      !Number.isInteger(toIndex) ||
      fromIndex < 0 ||
      fromIndex >= tempBoard.length ||
      toIndex < 0 ||
      toIndex >= tempBoard.length
    ) {
      return false;
    }

    const movingPiece = tempBoard[fromIndex].piece;
    if (!movingPiece) {
      return false;
    }

    let simulatedBoard = tempBoard.map((square, index) => {
      if (index === fromIndex) {
        return { piece: null };
      }

      if (index === toIndex) {
        return { piece: { ...movingPiece, location: toIndex } };
      }

      return square;
    });

    if (piece.name === 'pawn' && enPassantSquare !== undefined && toIndex === enPassantSquare && !squares[toIndex].piece) {
      const capturedIndex = piece.player === 'player1' ? toIndex + 8 : toIndex - 8;
      simulatedBoard = simulatedBoard.map((square, index) =>
        index === capturedIndex ? { piece: null } : square
      );
    }

    const kingSquare = simulatedBoard.findIndex(
      square => square.piece?.player === piece.player && square.piece.name === 'king'
    );

    return !isSquareAttacked(kingSquare, opponent(piece.player as Player), simulatedBoard);
  });

export const isKingInCheck = (player: Player, squares: SquareType[]): boolean => {
  const kingSquare = squares.findIndex(
    square => square.piece?.player === player && square.piece.name === 'king'
  );

  if (kingSquare === -1) {
    return false;
  }

  return isSquareAttacked(kingSquare, opponent(player), squares);
};

export const isCheckmate = (
  player: Player,
  squares: SquareType[],
  enPassantSquare?: number
): boolean => {
  if (!isKingInCheck(player, squares)) {
    return false;
  }

  for (let index = 0; index < 64; index++) {
    const piece = squares[index]?.piece;
    if (piece?.player !== player) {
      continue;
    }

    const pseudoMoves = generatePseudoLegalMoves(piece, index, squares, enPassantSquare);
    if (filterLegalMoves(piece, index, pseudoMoves, squares, enPassantSquare).length > 0) {
      return false;
    }
  }

  return true;
};

export const isStalemate = (
  player: Player,
  squares: SquareType[],
  enPassantSquare?: number
): boolean => {
  if (isKingInCheck(player, squares)) {
    return false;
  }

  for (let index = 0; index < 64; index++) {
    const piece = squares[index]?.piece;
    if (piece?.player !== player) {
      continue;
    }

    const pseudoMoves = generatePseudoLegalMoves(piece, index, squares, enPassantSquare);
    if (filterLegalMoves(piece, index, pseudoMoves, squares, enPassantSquare).length > 0) {
      return false;
    }
  }

  return true;
};

export function indexToSquareName(index: number): string {
  const file = index % 8;
  const rank = 8 - Math.floor(index / 8);
  return String.fromCharCode(97 + file) + rank;
}

export function squareNameToIndex(square: string): number {
  const file = square.charCodeAt(0) - 97;
  const rank = Number.parseInt(square[1], 10);
  return (8 - rank) * 8 + file;
}

export function squaresToFEN(
  squares: SquareType[],
  currentTurn: Player,
  lastMove?: FenMove | LastMove,
  halfmove = 0,
  fullmove = 1
): string {
  let fen = '';

  for (let rank = 0; rank < 8; rank++) {
    let empty = 0;
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file;
      const piece = squares[index].piece;

      if (!piece) {
        empty++;
        continue;
      }

      if (empty > 0) {
        fen += empty;
        empty = 0;
      }

      fen += pieceToFEN(piece);
    }

    if (empty > 0) {
      fen += empty;
    }

    if (rank !== 7) {
      fen += '/';
    }
  }

  const turn = currentTurn === 'player1' ? 'w' : 'b';

  let castling = '';

  const whiteKing = squares[60]?.piece;
  if (whiteKing?.name === 'king' && whiteKing.player === 'player1' && !whiteKing.hasMoved) {
    const rookH1 = squares[63]?.piece;
    if (rookH1?.name === 'rook' && rookH1.player === 'player1' && !rookH1.hasMoved) {
      castling += 'K';
    }

    const rookA1 = squares[56]?.piece;
    if (rookA1?.name === 'rook' && rookA1.player === 'player1' && !rookA1.hasMoved) {
      castling += 'Q';
    }
  }

  const blackKing = squares[4]?.piece;
  if (blackKing?.name === 'king' && blackKing.player === 'player2' && !blackKing.hasMoved) {
    const rookH8 = squares[7]?.piece;
    if (rookH8?.name === 'rook' && rookH8.player === 'player2' && !rookH8.hasMoved) {
      castling += 'k';
    }

    const rookA8 = squares[0]?.piece;
    if (rookA8?.name === 'rook' && rookA8.player === 'player2' && !rookA8.hasMoved) {
      castling += 'q';
    }
  }

  if (!castling) {
    castling = '-';
  }

  let enPassant = '-';
  if (lastMove) {
    const movedPiece = squares[lastMove.to]?.piece;
    if (movedPiece?.name === 'pawn') {
      const fromRank = Math.floor(lastMove.from / 8);
      const toRank = Math.floor(lastMove.to / 8);
      if (Math.abs(fromRank - toRank) === 2) {
        const file = lastMove.to % 8;
        const targetRank = (fromRank + toRank) / 2;
        enPassant = fileToLetter(file) + (8 - targetRank);
      }
    }
  }

  return `${fen} ${turn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
}

function fileToLetter(file: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + file);
}

function pieceToFEN(piece: Pick<PieceType, 'name' | 'player'>) {
  const map: Record<PieceType['name'], string> = {
    pawn: 'p',
    knight: 'n',
    bishop: 'b',
    rook: 'r',
    queen: 'q',
    king: 'k',
  };

  const letter = map[piece.name];
  return piece.player === 'player1' ? letter.toUpperCase() : letter;
}
