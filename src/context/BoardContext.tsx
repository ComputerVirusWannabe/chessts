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
  capturedPieces: PieceType[]; 
  handleSquareClick: (index: number) => void;
  handlePieceClick: (id: string, location: number, paths: number[]) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
  kingInCheckSquare: number | null;
  enPassantSquare: number | null;
  setEnPassantSquare: (pos: number | null) => void;
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

  const [capturedPieces, setCapturedPieces] = useState<PieceType[]>([]); // add at BoardContext top

  const [enPassantSquare, setEnPassantSquare] = useState<number | null>(null);

  const movePiece = (fromIndex: number, toIndex: number, enPassantSquare?: number) => {
    const movingPiece = { ...squares[fromIndex].piece!, location: toIndex, hasMoved: true };
    const targetPiece = squares[toIndex].piece;
  
    // Clone board
    const newSquares = squares.map(sq => ({ piece: sq.piece ? { ...sq.piece } : null }));
  
    // --- Move piece on board ---
    newSquares[toIndex].piece = movingPiece;
    newSquares[fromIndex].piece = null;
  
    // --- Captures ---
    let updatedCapturedPieces = [...capturedPieces];
  
    // Normal capture
    if (targetPiece) {
      updatedCapturedPieces.push({ ...targetPiece });
    }
  
    // En Passant capture
    if (movingPiece.name === 'pawn' && enPassantSquare !== null && toIndex === enPassantSquare) {
      const capturedIndex = movingPiece.player === 'player1' ? toIndex + 8 : toIndex - 8;
      const capturedPawn = newSquares[capturedIndex].piece;
      if (capturedPawn && capturedPawn.name === 'pawn') {
        console.log("En passant triggered!", capturedIndex, capturedPawn);
        newSquares[capturedIndex].piece = null;
        updatedCapturedPieces.push({ ...capturedPawn });
      }
    }
  
    setCapturedPieces(updatedCapturedPieces);
  
    // --- Pawn promotion ---
    const isPromotionRow =
      (movingPiece.player === 'player1' && toIndex >= 0 && toIndex <= 7) ||
      (movingPiece.player === 'player2' && toIndex >= 56 && toIndex <= 63);
  
    if (movingPiece.name === 'pawn' && isPromotionRow) {
      movingPiece.name = 'queen'; // auto-promote
    }
  
    // --- Castling ---
    if (movingPiece.name === 'king') {
      const delta = toIndex - fromIndex;
      const row = movingPiece.player === 'player1' ? 7 : 0;
  
      if (delta === 2) { // king-side
        const rookFrom = row * 8 + 7;
        const rookTo = row * 8 + 5;
        const rookPiece = { ...newSquares[rookFrom].piece!, location: rookTo, hasMoved: true };
        newSquares[rookTo].piece = rookPiece;
        newSquares[rookFrom].piece = null;
      } else if (delta === -2) { // queen-side
        const rookFrom = row * 8 + 0;
        const rookTo = row * 8 + 3;
        const rookPiece = { ...newSquares[rookFrom].piece!, location: rookTo, hasMoved: true };
        newSquares[rookTo].piece = rookPiece;
        newSquares[rookFrom].piece = null;
      }
    }
  
    // --- Update turn ---
    const nextTurn = Engine.opponent(currentTurn);
    setCurrentTurn(nextTurn);
  
    // --- Update board ---
    setSquares(newSquares);
  
    // --- Reset selection and highlights ---
    setSelectedPieceId(null);
    setHighlightedSquares([]);
  
    // --- King check highlighting ---
    const kingSquare = newSquares.findIndex(
      sq => sq.piece?.player === nextTurn && sq.piece.name === 'king'
    );
    setKingInCheckSquare(
      kingSquare >= 0 && Engine.isSquareAttacked(kingSquare, Engine.opponent(nextTurn), newSquares)
        ? kingSquare
        : null
    );
  
    // --- Update en passant square ---
    if (movingPiece.name === 'pawn' && Math.abs(toIndex - fromIndex) === 16) {
      console.log('Setting en passant square');
      setEnPassantSquare((fromIndex + toIndex) / 2);
    } else {
      console.log('Clearing en passant square');
      setEnPassantSquare(null);
    }
  
    // --- End-of-game checks ---
    setTimeout(() => {
      if (Engine.isCheckmate(nextTurn, newSquares)) {
        alert(`${nextTurn} is checkmated!`);
      } else if (Engine.isStalemate(nextTurn, newSquares)) {
        alert('Stalemate!');
      }
    }, 0);
  };
  
  
  


  const handleSquareClick = (toIndex: number) => {
    const clickedSquare = squares[toIndex];
    const clickedPiece = clickedSquare.piece;
  
    // If a piece is already selected
    const fromIndex = squares.findIndex(sq => sq.piece?.id === selectedPieceId);
  
    // --- No piece selected yet ---
    if (fromIndex === -1) {
      if (!clickedPiece) return; // empty square, nothing to select
      if (clickedPiece.player !== currentTurn) return; // ignore opponent's pieces
  
      const pseudoMoves = generatePseudoLegalMoves(clickedPiece, toIndex, squares, enPassantSquare as number | undefined);
  
      // Include castling moves for the king
      if (clickedPiece.name === 'king' && !clickedPiece.hasMoved) {
        pseudoMoves.push(...Engine.calculateCastlingMoves(clickedPiece, squares));
      }
  
      const legalMoves = Engine.filterLegalMoves(clickedPiece, toIndex, pseudoMoves, squares);
      if (!legalMoves.length) return; // piece has no legal moves
  
      setSelectedPieceId(clickedPiece.id);
      setHighlightedSquares(legalMoves);
      return;
    }
  
    // --- A piece is already selected, attempt move ---
    const piece = squares[fromIndex].piece!;
    if (!piece) {
      setSelectedPieceId(null);
      setHighlightedSquares([]);
      return;
    }
  
    const pseudoMoves = generatePseudoLegalMoves(piece, fromIndex, squares, enPassantSquare as number | undefined);
    if (piece.name === 'king' && !piece.hasMoved) {
      pseudoMoves.push(...Engine.calculateCastlingMoves(piece, squares));
    }
  
    const legalMoves = Engine.filterLegalMoves(piece, fromIndex, pseudoMoves, squares);
  
    if (!legalMoves.includes(toIndex)) {
      // Invalid move, deselect
      setSelectedPieceId(null);
      setHighlightedSquares([]);
      return;
    }
  
    // Valid move, perform it
    movePiece(fromIndex, toIndex, enPassantSquare as number | undefined);
  
    // Deselect piece after moving
    setSelectedPieceId(null);
    setHighlightedSquares([]);
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
        capturedPieces,
        enPassantSquare,
        setEnPassantSquare,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
