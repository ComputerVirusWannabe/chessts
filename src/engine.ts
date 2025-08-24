import { type PieceType, type SquareType } from './context/BoardContext';
import { generatePseudoLegalMoves } from './moveGenerators';

export const opponent = (player: 'player1' | 'player2') =>
  player === 'player1' ? 'player2' : 'player1';

// Check if a square is attacked by a given player
export const isSquareAttacked = (
  square: number,
  byPlayer: 'player1' | 'player2',
  board: SquareType[]
): boolean => {
  for (let i = 0; i < 64; i++) {
    const piece = board[i]?.piece;
    if (!piece || piece.player !== byPlayer) continue;
    const moves = generatePseudoLegalMoves(piece, i, board);
    if (moves.includes(square)) return true;
  }
  return false;
};

// Filter pseudo-legal moves to actual legal moves (king safety)
export const filterLegalMoves = (
  piece: PieceType,
  fromIndex: number,
  pseudoMoves: number[],
  squares: SquareType[]
): number[] => {
  return pseudoMoves.filter((toIndex) => {
    const tempBoard = squares.map(sq => ({ piece: sq.piece ? { ...sq.piece } : null }));
    tempBoard[toIndex].piece = { ...tempBoard[fromIndex].piece!, location: toIndex };
    tempBoard[fromIndex].piece = null;

    const kingSquare = tempBoard.findIndex(
      sq => sq.piece?.player === piece.player && sq.piece.name.toLowerCase() === 'king'
    );

    return !isSquareAttacked(kingSquare, opponent(piece.player!), tempBoard);
  });
};

export const isKingInCheck = (player: 'player1' | 'player2', squares: SquareType[]): boolean => {
  const kingSquare = squares.findIndex(
    sq => sq.piece?.player === player && sq.piece.name.toLowerCase() === 'king'
  );
  if (kingSquare === -1) return false;
  return isSquareAttacked(kingSquare, opponent(player), squares);
};

export const isCheckmate = (player: 'player1' | 'player2', squares: SquareType[]): boolean => {
  if (!isKingInCheck(player, squares)) return false;
  for (let i = 0; i < 64; i++) {
    const piece = squares[i]?.piece;
    if (piece?.player !== player) continue;
    const pseudoMoves = generatePseudoLegalMoves(piece, i, squares);
    if (filterLegalMoves(piece, i, pseudoMoves, squares).length > 0) return false;
  }
  return true;
};

export const isStalemate = (player: 'player1' | 'player2', squares: SquareType[]): boolean => {
  if (isKingInCheck(player, squares)) return false;
  for (let i = 0; i < 64; i++) {
    const piece = squares[i]?.piece;
    if (piece?.player !== player) continue;
    const pseudoMoves = generatePseudoLegalMoves(piece, i, squares);
    if (filterLegalMoves(piece, i, pseudoMoves, squares).length > 0) return false;
  }
  return true;
};

// Move a piece and return a new board
export const movePiece = (
  fromIndex: number,
  toIndex: number,
  squares: SquareType[]
): SquareType[] => {
  const newSquares = squares.map(sq => ({ piece: sq.piece ? { ...sq.piece } : null }));
  newSquares[toIndex].piece = { ...newSquares[fromIndex].piece!, location: toIndex };
  newSquares[fromIndex].piece = null;
  return newSquares;
};
