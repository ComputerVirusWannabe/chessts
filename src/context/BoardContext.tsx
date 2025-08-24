import React, { createContext, useState, type ReactNode } from 'react';
import { generatePseudoLegalMoves } from '../moveGenerators';
export type PieceType = {
  id: string;
  name: string; // 'pawn', 'rook', etc.
  color: string;
  player: 'player1' | 'player2' | null;
  location: number;
  hasMoved?: boolean; // Optional, used for pawns
};

type SquareType = {
  piece: PieceType | null;
};

type BoardContextType = {
  squares: SquareType[];
  selectedPieceId: string | null;
  highlightedSquares: number[];
  currentTurn: 'player1' | 'player2';
  handleSquareClick: (index: number) => void;
  handlePieceClick: (id: string, location: number, paths: number[]) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
  isSquareAttacked: (
    square: number,
    byPlayer: 'player1' | 'player2',
    board: SquareType[]
  ) => boolean;
  opponent: (player: 'player1' | 'player2') => 'player1' | 'player2';
  isKingInCheck: (player: 'player1' | 'player2') => boolean;
  filterLegalMoves: (
    piece: PieceType,
    fromIndex: number,
    pseudoMoves: number[]
  ) => number[];
  isCheckmate: (player: 'player1' | 'player2') => boolean;
  isStalemate: (player: 'player1' | 'player2') => boolean;
  kingInCheckSquare: number | null; // Square where the king is in check, if any
};

export const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialSquares: SquareType[] = Array.from({ length: 64 }, () => ({ piece: null }));

  const createPiece = (name: string, player: 'player1' | 'player2', location: number): PieceType => ({
    id: `${name}-${player}-${location}`,
    name,
    color: player === 'player1' ? 'grey' : 'red',
    player,
    location,
  });

  const [kingInCheckSquare, setKingInCheckSquare] = useState<number | null>(null);

  // Setup pieces
  for (let i = 0; i < 8; i++) initialSquares[8 + i].piece = createPiece('pawn', 'player2', 8 + i);
  initialSquares[0].piece = createPiece('rook', 'player2', 0);
  initialSquares[7].piece = createPiece('rook', 'player2', 7);
  initialSquares[1].piece = createPiece('knight', 'player2', 1);
  initialSquares[6].piece = createPiece('knight', 'player2', 6);
  initialSquares[2].piece = createPiece('bishop', 'player2', 2);
  initialSquares[5].piece = createPiece('bishop', 'player2', 5);
  initialSquares[3].piece = createPiece('queen', 'player2', 3);
  initialSquares[4].piece = createPiece('king', 'player2', 4);

  for (let i = 0; i < 8; i++) initialSquares[48 + i].piece = createPiece('pawn', 'player1', 48 + i);
  initialSquares[56].piece = createPiece('rook', 'player1', 56);
  initialSquares[63].piece = createPiece('rook', 'player1', 63);
  initialSquares[57].piece = createPiece('knight', 'player1', 57);
  initialSquares[62].piece = createPiece('knight', 'player1', 62);
  initialSquares[58].piece = createPiece('bishop', 'player1', 58);
  initialSquares[61].piece = createPiece('bishop', 'player1', 61);
  initialSquares[59].piece = createPiece('queen', 'player1', 59);
  initialSquares[60].piece = createPiece('king', 'player1', 60);

  const [squares, setSquares] = useState<SquareType[]>(initialSquares);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<number[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1'); // turn state

  // Move a piece from one square to another
  const movePiece = (fromIndex: number, toIndex: number) => {
    setSquares(prev => {
      const newSquares = prev.slice();
      newSquares[toIndex] = { piece: { ...newSquares[fromIndex].piece!, location: toIndex } };
      newSquares[fromIndex] = { piece: null };
  
      const nextPlayer = opponent(currentTurn);
  
      // Check if king is under fire using updated squares
      const kingPlayer = nextPlayer;
      const kingSquare = newSquares.findIndex(
        sq => sq.piece?.player === kingPlayer && sq.piece.name.toLowerCase() === 'king'
      );
      setKingInCheckSquare(isSquareAttacked(kingSquare, opponent(kingPlayer), newSquares) ? kingSquare : null);
  
      // End-of-game checks
      if (isCheckmate(nextPlayer)) {
        alert(`${nextPlayer} is checkmated!`);
      } else if (isStalemate(nextPlayer)) {
        alert('Stalemate!');
      } else {
        setCurrentTurn(nextPlayer);
      }
  
      return newSquares;
    });
  
    setSelectedPieceId(null);
    setHighlightedSquares([]);
  };

  const handleSquareClick = (toIndex: number) => {
    if (!selectedPieceId) return;
  
    const fromIndex = squares.findIndex(sq => sq.piece?.id === selectedPieceId);
    if (fromIndex === -1) return;
  
    const piece = squares[fromIndex].piece!;
    const pseudoMoves = generatePseudoLegalMoves(piece, fromIndex, squares);
    const legalMoves = filterLegalMoves(piece, fromIndex, pseudoMoves);
  
    if (!legalMoves.includes(toIndex)) {
      // clicked an invalid square
      setSelectedPieceId(null);
      setHighlightedSquares([]);
      return;
    }
  
    movePiece(fromIndex, toIndex);
  };
  

  const handlePieceClick = (id: string, location: number, paths: number[]) => {
    const piece = squares.find(sq => sq.piece?.id === id)?.piece;
    if (!piece || piece.player !== currentTurn) return; // block clicks from wrong player

    setSelectedPieceId(id);
    setHighlightedSquares(paths);
  };


  const opponent = (player: 'player1' | 'player2') =>
    player === 'player1' ? 'player2' : 'player1';

  const isSquareAttacked = (
    square: number,
    byPlayer: 'player1' | 'player2',
    board: { piece: PieceType | null }[]
  ): boolean => {
    for (let i = 0; i < 64; i++) {
      const piece = board[i]?.piece;
      if (!piece || piece.player !== byPlayer) continue;

      const moves = generatePseudoLegalMoves(piece, i, board);
      if (moves.includes(square)) return true;
    }
    return false;
  };
  

  const isKingInCheck = (player: 'player1' | 'player2'): boolean => {
    const kingSquare = squares.findIndex(
      (sq) => sq.piece?.player === player && sq.piece.name.toLowerCase() === 'king'
    );
    if (kingSquare === -1) return false; // Safety check 
    const opp = opponent(player);
    return isSquareAttacked(kingSquare, opp, squares);
  };

  const isCheckmate = (player: 'player1' | 'player2'): boolean => {
    if (!isKingInCheck(player)) return false;

    for (let i = 0; i < 64; i++) {
      const piece = squares[i]?.piece;
      if (piece?.player !== player) continue;

      const pseudoMoves = generatePseudoLegalMoves(piece, i, squares);
      const legalMoves = filterLegalMoves(piece, i, pseudoMoves);
      if (legalMoves.length > 0) return false; // Player has at least one move
    }

    return true; // No moves left while in check = checkmate
  };
  
  const isStalemate = (player: 'player1' | 'player2'): boolean => {
    if (isKingInCheck(player)) return false;

    for (let i = 0; i < 64; i++) {
      const piece = squares[i]?.piece;
      if (piece?.player !== player) continue;

      const pseudoMoves = generatePseudoLegalMoves(piece, i, squares);
      const legalMoves = filterLegalMoves(piece, i, pseudoMoves);
      if (legalMoves.length > 0) return false; // Player has moves = not stalemate
    }

    return true; // No moves left and not in check = stalemate
  };
  
  
  const filterLegalMoves = (
    piece: PieceType,
    fromIndex: number,
    pseudoMoves: number[]
  ): number[] => {
    return pseudoMoves.filter((toIndex) => {
      const tempBoard = squares.map(sq => ({ piece: sq.piece ? { ...sq.piece } : null }));
      tempBoard[toIndex].piece = { ...tempBoard[fromIndex].piece!, location: toIndex };
      tempBoard[fromIndex].piece = null;

      const kingSafe = !isSquareAttacked(
        tempBoard.findIndex(sq => sq.piece?.player === piece.player && sq.piece.name.toLowerCase() === 'king'),
        opponent(piece.player as 'player1' | 'player2'), // Ensure piece.player is not null
        tempBoard
      );

      return kingSafe;
    });
  };

  return (
    <BoardContext.Provider
      value={{
        squares,
        selectedPieceId,
        highlightedSquares,
        currentTurn,
        handleSquareClick,
        movePiece,
        handlePieceClick,
        isSquareAttacked,
        opponent,
        isKingInCheck,
        filterLegalMoves,
        isCheckmate,
        isStalemate,
        kingInCheckSquare,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
