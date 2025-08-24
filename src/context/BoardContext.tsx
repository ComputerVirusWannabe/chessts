import React, { createContext, useState, type ReactNode } from 'react';
import { generatePseudoLegalMoves } from '../moveGenerators';
import * as Engine from '../engine';

export type PieceType = {
  id: string;
  name: string; // 'pawn', 'rook', etc.
  color: string;
  player: 'player1' | 'player2' | null;
  location: number;
  hasMoved?: boolean;
};

export type SquareType = {
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
  kingInCheckSquare: number | null;
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
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');

  // Move a piece
  const movePiece = (fromIndex: number, toIndex: number) => {
    setSquares(prev => {
      const newSquares = prev.slice(); // shallow copy is safer
      const movingPiece = { ...newSquares[fromIndex].piece!, location: toIndex };
      newSquares[toIndex] = { piece: movingPiece };
      newSquares[fromIndex] = { piece: null };
  
      // Check king safety
      const nextPlayer = Engine.opponent(currentTurn);
      const kingSquare = newSquares.findIndex(
        sq => sq.piece?.player === nextPlayer && sq.piece.name.toLowerCase() === 'king'
      );
      setKingInCheckSquare(
        kingSquare >= 0 && Engine.isSquareAttacked(kingSquare, Engine.opponent(nextPlayer), newSquares)
          ? kingSquare
          : null
      );
  
      return newSquares;
    });
  
    setCurrentTurn(prev => Engine.opponent(prev)); // functional update to avoid stale closure
    setSelectedPieceId(null);
    setHighlightedSquares([]);
  
    // End-of-game checks after squares update
    setTimeout(() => {
      const nextPlayer = Engine.opponent(currentTurn);
      if (Engine.isCheckmate(nextPlayer, squares)) {
        alert(`${nextPlayer} is checkmated!`);
      } else if (Engine.isStalemate(nextPlayer, squares)) {
        alert('Stalemate!');
      }
    }, 0);
  };
  

  const handleSquareClick = (toIndex: number) => {
    if (!selectedPieceId) return;

    const fromIndex = squares.findIndex(sq => sq.piece?.id === selectedPieceId);
    if (fromIndex === -1) return;

    const piece = squares[fromIndex].piece!;
    const pseudoMoves = generatePseudoLegalMoves(piece, fromIndex, squares);
    const legalMoves = Engine.filterLegalMoves(piece, fromIndex, pseudoMoves, squares);

    if (!legalMoves.includes(toIndex)) {
      setSelectedPieceId(null);
      setHighlightedSquares([]);
      return;
    }

    movePiece(fromIndex, toIndex);
  };

  const handlePieceClick = (id: string, location: number, paths: number[]) => {
    const piece = squares.find(sq => sq.piece?.id === id)?.piece;
    if (!piece || piece.player !== currentTurn) return;

    setSelectedPieceId(id);
    setHighlightedSquares(paths);
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
        kingInCheckSquare,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
