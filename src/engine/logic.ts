import { type PieceType, type SquareType } from '../context/BoardContext';
import { generatePseudoLegalMoves } from './moveGenerators';


type Move = {
  from: number; // 0..63 board index
  to: number;   // 0..63 board index
};

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

  export const calculateCastlingMoves = (piece: PieceType, board: SquareType[]): number[] => {
    const moves: number[] = [];
    const { location, player, hasMoved } = piece;
    if (!player || hasMoved || piece.name !== 'king') return moves;
  
    const row = Math.floor(location / 8); // king's current row
    const opponentPlayer = opponent(player);
  
    // Find all rooks of the same player on the same row
    const rooks = board
      .map((sq, idx) => ({ sq, idx }))
      .filter(({ sq, idx }) => 
        sq.piece?.player === player &&
        sq.piece.name === 'rook' &&
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
      sq => sq.piece?.player === piece.player && sq.piece.name === 'king'
    );

    return !isSquareAttacked(kingSquare, opponent(piece.player!), tempBoard);
  });
};

export const isKingInCheck = (player: 'player1' | 'player2', squares: SquareType[]): boolean => {
  const kingSquare = squares.findIndex(
    sq => sq.piece?.player === player && sq.piece.name === 'king'
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

//for stockfish:
// index (0..63) -> "a8".."h1"
export function indexToSquareName(index: number): string {
  const file = index % 8;       // 0..7
  const rank = 8 - Math.floor(index / 8); // 8..1
  return String.fromCharCode(97 + file) + rank; // 'a' + file
}

// "e2" -> index (0..63)
export function squareNameToIndex(square: string): number {
  const file = square.charCodeAt(0) - 97; // 'a' = 0
  const rank = parseInt(square[1]);       // '1'..'8'
  return (8 - rank) * 8 + file;
}

export function squaresToFEN(
  squares: SquareType[],
  currentTurn: "player1" | "player2",
  lastMove?: Move,
  halfmove = 0,
  fullmove = 1
): string {
  let fen = "";

  // --- Board position ---
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
      fen += pieceToFEN(piece as { name: string; player: "player1" | "player2" });
    }
    if (empty > 0) fen += empty;
    if (rank !== 7) fen += "/";
  }

  // --- Active color ---
  const turn = currentTurn === "player1" ? "w" : "b";

  // --- Castling rights ---
  let castling = "";

  // White pieces
  const whiteKing = squares[60]?.piece; // e1
  if (whiteKing?.name === "King" && whiteKing.player === "player1" && !whiteKing.hasMoved) {
    const rookH1 = squares[63]?.piece; // h1
    if (rookH1?.name === "Rook" && rookH1.player === "player1" && !rookH1.hasMoved) {
      castling += "K";
    }
    const rookA1 = squares[56]?.piece; // a1
    if (rookA1?.name === "Rook" && rookA1.player === "player1" && !rookA1.hasMoved) {
      castling += "Q";
    }
  }

  // Black pieces
  const blackKing = squares[4]?.piece; // e8
  if (blackKing?.name === "King" && blackKing.player === "player2" && !blackKing.hasMoved) {
    const rookH8 = squares[7]?.piece; // h8
    if (rookH8?.name === "Rook" && rookH8.player === "player2" && !rookH8.hasMoved) {
      castling += "k";
    }
    const rookA8 = squares[0]?.piece; // a8
    if (rookA8?.name === "Rook" && rookA8.player === "player2" && !rookA8.hasMoved) {
      castling += "q";
    }
  }

  if (castling === "") castling = "-";

  // --- En passant target square ---
  let enPassant = "-";
  if (lastMove) {
    const piece = squares[lastMove.to]?.piece;
    if (piece?.name === "Pawn") {
      const fromRank = Math.floor(lastMove.from / 8);
      const toRank = Math.floor(lastMove.to / 8);

      // Pawn moved 2 squares
      if (Math.abs(fromRank - toRank) === 2) {
        const file = lastMove.to % 8;
        const targetRank = (fromRank + toRank) / 2; // middle square
        enPassant = fileToLetter(file) + (8 - targetRank);
      }
    }
  }

  // --- Final FEN ---
  return `${fen} ${turn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
}

// Helper to map 0..7 -> a..h
function fileToLetter(file: number): string {
  return String.fromCharCode("a".charCodeAt(0) + file);
}

// map your PieceType to FEN letters
function pieceToFEN(piece: { name: string; player: "player1" | "player2" }) {
  const map: Record<string, string> = {
    pawn: "p",
    knight: "n",
    bishop: "b",
    rook: "r",
    queen: "q",
    king: "k",
  };
  const letter = map[piece.name];
  return piece.player === "player1" ? letter.toUpperCase() : letter;
}
