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

export const calculateCastlingMovesSimple_NOT_USED = (piece: PieceType, board: SquareType[]): number[] => {
    const moves: number[] = [];
    const { location, player, hasMoved } = piece;
    if (!player || hasMoved) return moves;
  
    const row = player === 'player1' ? 7 : 0; // adjust for player convention.
    //RIght now this assume player1 is on row 7 and player2 on row 0 which may be flipped later.
  
    // Kingside
    const kingsideRookIndex = row * 8 + 7;
    const kingsidePath = [row * 8 + 5, row * 8 + 6];
    if (
      board[kingsideRookIndex].piece?.name.toLowerCase() === 'rook' &&
      !board[kingsideRookIndex].piece?.hasMoved &&
      kingsidePath.every(sq => !board[sq].piece) &&
      kingsidePath.every(sq => !isSquareAttacked(sq, opponent(player), board))
    ) {
      moves.push(location + 2);
    }
  
    // Queenside
    const queensideRookIndex = row * 8 + 0;
    const queensidePath = [row * 8 + 1, row * 8 + 2, row * 8 + 3];
    if (
      board[queensideRookIndex].piece?.name.toLowerCase() === 'rook' &&
      !board[queensideRookIndex].piece?.hasMoved &&
      queensidePath.slice(0, 2).every(sq => !board[sq].piece) &&
      queensidePath.slice(0, 2).every(sq => !isSquareAttacked(sq, opponent(player), board))
    ) {
      moves.push(location - 2);
    }
  
    return moves;
  };

  export const calculateCastlingMoves = (piece: PieceType, board: SquareType[]): number[] => {
    const moves: number[] = [];
    const { location, player, hasMoved } = piece;
    if (!player || hasMoved || piece.name.toLowerCase() !== 'king') return moves;
  
    const row = Math.floor(location / 8); // king's current row
    const opponentPlayer = opponent(player);
  
    // Find all rooks of the same player on the same row
    const rooks = board
      .map((sq, idx) => ({ sq, idx }))
      .filter(({ sq, idx }) => 
        sq.piece?.player === player &&
        sq.piece.name.toLowerCase() === 'rook' &&
        !sq.piece.hasMoved &&
        Math.floor(idx / 8) === row
      );
  
    for (const { sq, idx } of rooks) {
      const direction = idx > location ? 1 : -1; // right = kingside, left = queenside
      const pathIndices = [];
      for (let i = location + direction; i !== idx; i += direction) {
        pathIndices.push(i);
      }
  
      // Check path is empty
      if (pathIndices.every(i => !board[i].piece) &&
          pathIndices.every(i => !isSquareAttacked(i, opponentPlayer, board))) {
        // Move king two squares towards the rook
        moves.push(location + 2 * direction);
      }
    }
  
    return moves;
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