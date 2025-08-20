import React, { createContext, useState, type ReactNode } from 'react';

export type PieceType = {
  id: string;
  name: string; // 'pawn', 'rook', etc.
  color: string; // visual color
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
  handleSquareClick: (index: number) => void;
  handlePieceClick: (id: string, location: number, paths: number[]) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
};

export const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize empty board
  const initialSquares: SquareType[] = Array.from({ length: 64 }, () => ({ piece: null }));

  // Helper to create a piece
  const createPiece = (name: string, player: 'player1' | 'player2', location: number): PieceType => ({
    id: `${name}-${player}-${location}`,
    name,
    color: player === 'player1' ? 'grey' : 'red',
    player,
    location,
  });

  // Setup pieces
  // Player2 (top)
  for (let i = 0; i < 8; i++) initialSquares[8 + i].piece = createPiece('pawn', 'player2', 8 + i);
  initialSquares[0].piece = createPiece('rook', 'player2', 0);
  initialSquares[7].piece = createPiece('rook', 'player2', 7);
  initialSquares[1].piece = createPiece('knight', 'player2', 1);
  initialSquares[6].piece = createPiece('knight', 'player2', 6);
  initialSquares[2].piece = createPiece('bishop', 'player2', 2);
  initialSquares[5].piece = createPiece('bishop', 'player2', 5);
  initialSquares[3].piece = createPiece('queen', 'player2', 3);
  initialSquares[4].piece = createPiece('king', 'player2', 4);
  
  //empty squares:
  //for (let i = 16; i < 48; i++) initialSquares[i].piece = createPiece('Empty', 'none', i);
  // Player1 (bottom)
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

  // Move a piece from one square to another
  const movePiece = (fromIndex: number, toIndex: number) => {
    setSquares(prev => {
      const newSquares = [...prev];
      newSquares[toIndex] = { piece: newSquares[fromIndex].piece };
      newSquares[toIndex].piece!.location = toIndex;
      newSquares[fromIndex] = { piece: null };
      return newSquares;
    });
    setSelectedPieceId(null);
    setHighlightedSquares([]);
  };

  // Called when a square is clicked
  const handleSquareClick = (index: number) => {
    if (selectedPieceId) {
      const fromIndex = squares.findIndex(sq => sq.piece?.id === selectedPieceId);
      if (fromIndex !== -1 && highlightedSquares.includes(index)) {
        movePiece(fromIndex, index);
      }
      setSelectedPieceId(null);
      setHighlightedSquares([]);
    }
  };

  // Called when a piece is clicked
  const handlePieceClick = (id: string, location: number, paths: number[]) => {
    console.log('BoardContext handlePieceClick', id, location, paths);
    setSelectedPieceId(id);
    setHighlightedSquares(paths); 
  };
  

  return (
    <BoardContext.Provider
    
      value={{
        squares,
        selectedPieceId,
        highlightedSquares,
        handleSquareClick,
        movePiece,
        handlePieceClick,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
