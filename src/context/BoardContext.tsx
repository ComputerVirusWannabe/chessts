import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

// Types
export type ChessPiece = {
  id: string;
  name: string;
  color: string;
  hasMoved?: boolean;
  player: "player1" | "player2" | null;
};

type BoardContextType = {
  pieces: ChessPiece[];
  setPieces: React.Dispatch<React.SetStateAction<ChessPiece[]>>;
  playerTurn: "player1" | "player2";
  setPlayerTurn: React.Dispatch<React.SetStateAction<"player1" | "player2">>;
};

const BoardContext = createContext<BoardContextType | undefined>(undefined);

// hook
export const useBoardContext = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoardContext must be used inside a BoardProvider");
  return ctx;
};

// provider with initial state
export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pieces, setPieces] = useState<ChessPiece[]>([
    // Row 1 (Red pieces)
    { id: uuidv4(), name: "Rook", color: "red", player: "player1" },
    { id: uuidv4(), name: "Knight", color: "red", player: "player1" },
    { id: uuidv4(), name: "Bishop", color: "red", player: "player1" },
    { id: uuidv4(), name: "Queen", color: "red", player: "player1" },
    { id: uuidv4(), name: "King", color: "red", player: "player1" },
    { id: uuidv4(), name: "Bishop", color: "red", player: "player1" },
    { id: uuidv4(), name: "Knight", color: "red", player: "player1" },
    { id: uuidv4(), name: "Rook", color: "red", player: "player1" },
    { id: uuidv4(), name: "Pawn", color: "red", player: "player1" },
    { id: uuidv4(), name: "Pawn", color: "red", player: "player1" },
    { id: uuidv4(), name: "Pawn", color: "red", player: "player1" },
    { id: uuidv4(), name: "Pawn", color: "red", player: "player1" },
    { id: uuidv4(), name: "Pawn", color: "red", player: "player1" },
    { id: uuidv4(), name: "Pawn", color: "red", player: "player1" },
    { id: uuidv4(), name: "Pawn", color: "red", player: "player1" },
    { id: uuidv4(), name: "Pawn", color: "red", player: "player1" },

    // Empty middle rows
    ...Array(32).fill(null).map(() => ({
      id: uuidv4(),
      name: "Empty",
      color: "green",
      player: null,
    })),

    // Row 7 (Grey pawns)
    { id: uuidv4(), name: "Pawn", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Pawn", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Pawn", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Pawn", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Pawn", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Pawn", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Pawn", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Pawn", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Rook", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Knight", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Bishop", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Queen", color: "grey", player: "player2" },
    { id: uuidv4(), name: "King", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Bishop", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Knight", color: "grey", player: "player2" },
    { id: uuidv4(), name: "Rook", color: "grey", player: "player2" },
  ]);

  const [playerTurn, setPlayerTurn] = useState<"player1" | "player2">("player1");

  return (
    <BoardContext.Provider value={{ pieces, setPieces, playerTurn, setPlayerTurn }}>
      {children}
    </BoardContext.Provider>
  );
};
