
export type ChessPiece = {
    id: string;
    name: string;
    color: string;
    hasMoved?: boolean;
    location?: number;
  };
  type Board = ChessPiece[];
  
  // ROOK 
  export const getRookMoves = (piece: ChessPiece, board: Board): number[] => {
    if (piece.location === undefined) return [];
    const { color, location } = piece;
    const row = Math.floor(location / 8);
    const col = location % 8;
    const moves: number[] = [];
  
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];
  
    for (const { dr, dc } of directions) {
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const index = r * 8 + c;
        const target = board[index];
        if (target.name === "Empty") {
          moves.push(index);
        } else if (target.color !== color) {
          moves.push(index);
          break;
        } else break;
        r += dr;
        c += dc;
      }
    }
    return moves;
  };
  
  // PAWN
  export const getPawnMoves = (piece: ChessPiece, board: Board): number[] => {
    if (piece.location === undefined) return [];
    const { color, location } = piece;
    const row = Math.floor(location / 8);
    const moves: number[] = [];
  
    const direction = color === "red" ? 1 : -1;
    const forwardOne = location + direction * 8;
    const forwardTwo = location + direction * 16;
    const startingRow = color === "red" ? 1 : 6;
  
    if (forwardOne >= 0 && forwardOne < 64 && board[forwardOne].name === "Empty") {
      moves.push(forwardOne);
      if (row === startingRow && board[forwardTwo].name === "Empty") {
        moves.push(forwardTwo);
      }
    }
  
    const captureLeft = location + direction * 8 - 1;
    const captureRight = location + direction * 8 + 1;
  
    if (
      captureLeft >= 0 &&
      captureLeft < 64 &&
      captureLeft % 8 !== 7 &&
      board[captureLeft].name !== "Empty" &&
      board[captureLeft].color !== color
    ) {
      moves.push(captureLeft);
    }
    if (
      captureRight >= 0 &&
      captureRight < 64 &&
      captureRight % 8 !== 0 &&
      board[captureRight].name !== "Empty" &&
      board[captureRight].color !== color
    ) {
      moves.push(captureRight);
    }
  
    return moves;
  };

  export const getLegalMoves = (piece: ChessPiece, board: Board): number[] => {
    switch (piece.name) {
      case "Rook":
        return getRookMoves(piece, board);
      case "Pawn":
        return getPawnMoves(piece, board);
      default:
        return [];
    }
  };
  