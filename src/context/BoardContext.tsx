import React, { createContext, useState, type ReactNode } from 'react';
import { generatePseudoLegalMoves } from '../engine/moveGenerators';
import * as Engine from '../engine/logic';
import PromotionDialog from '../components/PromotionDialog';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import { StockfishEngine } from '../ai/StockfishEngine';

export type PieceType = {
  id: string;
  name: string; // 'pawn', 'rook', etc.
  color: string;
  player: 'player1' | 'player2' | null;
  location: number;
  hasMoved?: boolean;
};

type GameMode = 'human-vs-human' | 'human-vs-ai' | null;

type Move = {
  from: number;
  to: number;
  piece: PieceType;
  captured?: PieceType;
};


type CastlingRights = {
  K: boolean; // White kingside
  Q: boolean; // White queenside
  k: boolean; // Black kingside
  q: boolean; // Black queenside
};

export type SquareType = {
  piece: PieceType | null;
};

type BoardContextType = {
  squares: SquareType[];
  setSquares: React.Dispatch<React.SetStateAction<SquareType[]>>;
  selectedPieceId: string | null;
  highlightedSquares: number[];
  setHighlightedSquares: React.Dispatch<React.SetStateAction<number[]>>;
  currentTurn: 'player1' | 'player2';
  capturedPieces: PieceType[]; 
  setCapturedPieces: React.Dispatch<React.SetStateAction<PieceType[]>>;
  handleSquareClick: (index: number) => void;
  handlePieceClick: (id: string, location: number, paths: number[]) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
  lastMove: Move | null;
  setLastMove: React.Dispatch<React.SetStateAction<Move | null>>;
  kingInCheckSquare: number | null;
  enPassantSquare: number | null;
  setEnPassantSquare: (pos: number | null) => void;
  promotionPawn: { index: number; player: 'player1' | 'player2' } | null;
  setPromotionPawn: React.Dispatch<React.SetStateAction<{ index: number; player: 'player1' | 'player2' } | null>>;
  promotePawn: (pieceName: 'queen' | 'rook' | 'bishop' | 'knight') => void;
  humanPlayer: 'player1' | 'player2' | null;
  setHumanPlayer: React.Dispatch<React.SetStateAction<'player1' | 'player2' | null>>;
  setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
  gameMode: GameMode;
  createInitialSquares: () => SquareType[];
};

export const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [kingInCheckSquare, setKingInCheckSquare] = useState<number | null>(null);

  const createInitialSquares = (): SquareType[] => {
    const squares: SquareType[] = Array.from({ length: 64 }, () => ({ piece: null }));
  
    const createPiece = (name: string, player: 'player1' | 'player2', location: number): PieceType => ({
      id: uuidv4(),
      name,
      color: player === 'player1' ? 'white' : 'brown',
      player,
      location,
    });
  
    // Player2 pieces (top)
    for (let i = 0; i < 8; i++) squares[8 + i].piece = createPiece('pawn', 'player2', 8 + i);
    squares[0].piece = createPiece('rook', 'player2', 0);
    squares[7].piece = createPiece('rook', 'player2', 7);
    squares[1].piece = createPiece('knight', 'player2', 1);
    squares[6].piece = createPiece('knight', 'player2', 6);
    squares[2].piece = createPiece('bishop', 'player2', 2);
    squares[5].piece = createPiece('bishop', 'player2', 5);
    squares[3].piece = createPiece('queen', 'player2', 3);
    squares[4].piece = createPiece('king', 'player2', 4);
  
    // Player1 pieces (bottom)
    for (let i = 0; i < 8; i++) squares[48 + i].piece = createPiece('pawn', 'player1', 48 + i);
    squares[56].piece = createPiece('rook', 'player1', 56);
    squares[63].piece = createPiece('rook', 'player1', 63);
    squares[57].piece = createPiece('knight', 'player1', 57);
    squares[62].piece = createPiece('knight', 'player1', 62);
    squares[58].piece = createPiece('bishop', 'player1', 58);
    squares[61].piece = createPiece('bishop', 'player1', 61);
    squares[59].piece = createPiece('queen', 'player1', 59);
    squares[60].piece = createPiece('king', 'player1', 60);
  
    return squares;
  };

  const [squares, setSquares] = useState<SquareType[]>(createInitialSquares());

  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  const [highlightedSquares, setHighlightedSquares] = useState<number[]>([]);

  const [capturedPieces, setCapturedPieces] = useState<PieceType[]>([]);

  const [enPassantSquare, setEnPassantSquare] = useState<number | null>(null);

  const [lastMove, setLastMove] = useState<Move | null>(null);

  const [humanPlayer, setHumanPlayer] = useState<'player1' | 'player2' | null>(null);

  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');

  const [gameMode, setGameMode] = useState<GameMode>(null);

  const [promotionPawn, setPromotionPawn] = useState<{
    index: number;
    player: 'player1' | 'player2';
  } | null>(null);

  const stockfish = new StockfishEngine();
  useEffect(() => {
    stockfish.init(); // run handshake once
  }, []);

  useEffect(() => {
    if (!humanPlayer) return;
    // if human picks player2, AI should start as player1
    setCurrentTurn(humanPlayer === 'player2' ? 'player1' : 'player1');
  }, [humanPlayer]);
  
  useEffect(() => {
    if (!humanPlayer) return;
    if (gameMode !== 'human-vs-ai') return; // <-- only run AI in human-vs-ai mode
  
    // Determine AI player
    const aiPlayer: 'player1' | 'player2' = humanPlayer === 'player1' ? 'player2' : 'player1';
    if (currentTurn !== aiPlayer) return; // only run when it’s AI’s turn
  
    const fen = Engine.squaresToFEN(
      squares,
      currentTurn,
      lastMove as Move | undefined,
      0,
      1
    );
  
    stockfish.getBestMove(fen, 10).then((bestMove) => {
      const fromIndex = Engine.squareNameToIndex(bestMove.slice(0, 2));
      const toIndex = Engine.squareNameToIndex(bestMove.slice(2, 4));
  
      let promotionPiece: "queen" | "rook" | "bishop" | "knight" | undefined;
      if (bestMove.length === 5) {
        promotionPiece =
          bestMove[4] === "q" ? "queen" :
          bestMove[4] === "r" ? "rook" :
          bestMove[4] === "b" ? "bishop" :
          "knight";
      }
  
      movePiece(fromIndex, toIndex, undefined, promotionPiece);
    });
  }, [currentTurn, humanPlayer, gameMode, squares, lastMove]);
  
  
  function castlingRightsToString(c: CastlingRights): string {
    const s = (c.K ? "K" : "") + (c.Q ? "Q" : "") + (c.k ? "k" : "") + (c.q ? "q" : "");
    return s || "-";
  }

  const promotePawn = (piece: 'queen' | 'rook' | 'bishop' | 'knight') => {
    if (!promotionPawn) return;
  
    const { index, player } = promotionPawn;
  
    setSquares(prevSquares => {
      const newSquares = prevSquares.map(sq => ({ piece: sq.piece ? { ...sq.piece } : null }));
  
      const oldPawn = newSquares[index].piece;
      if (!oldPawn) return newSquares;
  
      // Replace pawn with chosen piece
      newSquares[index].piece = {
        id: uuidv4(),
        name: piece,
        color: oldPawn.color,
        player: oldPawn.player,
        location: index,
        hasMoved: true
      };
  
      // Check if new piece is putting opponent king in check
      const opponent = Engine.opponent(player);
      const kingSquare = newSquares.findIndex(
        sq => sq.piece?.player === opponent && sq.piece.name === 'king'
      );
      setKingInCheckSquare(
        kingSquare >= 0 && Engine.isSquareAttacked(kingSquare, player, newSquares)
          ? kingSquare
          : null
      );
  
      // Check for checkmate or stalemate
      setTimeout(() => {
        if (Engine.isCheckmate(opponent, newSquares)) {
          alert(`${opponent} is checkmated!`);
        } else if (Engine.isStalemate(opponent, newSquares)) {
          alert('Stalemate!');
        }
      }, 0);
  
      return newSquares;
    });
  
    // Clear promotion state
    setPromotionPawn(null);
  
    // Switch turn
    setCurrentTurn(Engine.opponent(player));
  
    // Reset selection and highlights
    setSelectedPieceId(null);
    setHighlightedSquares([]);
  
    console.log(`Pawn promoted at index ${index} to ${piece}`);
  };
  
  const movePiece = (fromIndex: number, toIndex: number, enPassantSquare?: number, promotionPiece?: "queen" | "rook" | "bishop" | "knight") => {
    if (!squares[fromIndex]?.piece) {
      console.warn('Attempted to move from an empty or undefined square', fromIndex);
      return;
    }
    const movingPiece = { ...squares[fromIndex].piece!, location: toIndex, hasMoved: true };
    const targetPiece = squares[toIndex].piece;
  
    // Clone board
    const newSquares = squares.map(sq => ({ piece: sq.piece ? { ...sq.piece } : null }));
  
    // --- Move piece ---
    newSquares[toIndex].piece = movingPiece;
    newSquares[fromIndex].piece = null;
  
    // --- Normal capture ---
    let updatedCapturedPieces = [...capturedPieces];
    if (targetPiece) {
      updatedCapturedPieces.push({ ...targetPiece, id: uuidv4() });
    }
  
    // --- En Passant capture ---
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
    // --- Pawn promotion ---
  const isPromotionRow =
  (movingPiece.player === 'player1' && toIndex >= 0 && toIndex <= 7) ||
  (movingPiece.player === 'player2' && toIndex >= 56 && toIndex <= 63);

  if (movingPiece.name === 'pawn' && isPromotionRow) {
    if (promotionPiece) {
      movingPiece.name = promotionPiece; // promote immediately
    } else {
      setSquares(newSquares);
      setPromotionPawn({ index: toIndex, player: movingPiece.player as 'player1' | 'player2' });
      return;
    }
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
  
    // --- Update board and turn ---
    setSquares(newSquares);
    setCurrentTurn(Engine.opponent(currentTurn));
  
    // --- Reset selection and highlights ---
    setSelectedPieceId(null);
    setHighlightedSquares([]);
  
    // --- King in check highlighting ---
    const kingSquare = newSquares.findIndex(
      sq => sq.piece?.player === Engine.opponent(currentTurn) && sq.piece.name === 'king'
    );
    setKingInCheckSquare(
      kingSquare >= 0 && Engine.isSquareAttacked(kingSquare, currentTurn, newSquares)
        ? kingSquare
        : null
    );
  
    // --- En passant square ---
    if (movingPiece.name === 'pawn' && Math.abs(toIndex - fromIndex) === 16) {
      setEnPassantSquare((fromIndex + toIndex) / 2);
    } else {
      setEnPassantSquare(null);
    }
  
    // --- Track lastMove for FEN ---
    const lastMoveObj: Move = { from: fromIndex, to: toIndex, piece: movingPiece, captured: targetPiece || undefined };
    setLastMove(lastMoveObj);
  
    // --- End-of-game checks ---
    setTimeout(() => {
      if (Engine.isCheckmate(Engine.opponent(currentTurn), newSquares)) {
        alert(`${Engine.opponent(currentTurn)} is checkmated!`);
      } else if (Engine.isStalemate(Engine.opponent(currentTurn), newSquares)) {
        alert('Stalemate!');
      }
    }, 0);
  };
  

  const handleSquareClick = (toIndex: number) => {
    if (gameMode === 'human-vs-ai' && currentTurn !== humanPlayer) return; // block AI turn
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
    
    //Pawn Promotion check:
    if (piece.name === 'pawn') {
      const finalRank = piece.player === 'player1' ? 0 : 7;
      if (toIndex / 8 === finalRank) {
        console.log( "Pawn promotion triggered!");
        setPromotionPawn({ index: toIndex, player: piece.player as 'player1' | 'player2' });
        return; // stop further move until promotion is handled
      }
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
        setSquares,
        selectedPieceId,
        highlightedSquares,
        setHighlightedSquares,
        currentTurn,
        handleSquareClick,
        movePiece,
        lastMove,
        setLastMove,
        handlePieceClick,
        kingInCheckSquare,
        capturedPieces,
        setCapturedPieces,
        enPassantSquare,
        setEnPassantSquare,
        promotionPawn,
        setPromotionPawn,
        promotePawn,
        humanPlayer,
        setHumanPlayer,
        setGameMode,
        gameMode,
        createInitialSquares,
      }}
    >
      {children}
      {promotionPawn && (
        <>
         {console.log('Rendering promotion dialog for player', promotionPawn.player)}
        <PromotionDialog
          //player={promotionPawn.player}
          
          onSelect={piece => {console.log('Promotion selected:', piece); 
          promotePawn(piece as 'queen' | 'rook' | 'bishop' | 'knight')}}
        />
        </>
      )}
    </BoardContext.Provider>
  );
};
