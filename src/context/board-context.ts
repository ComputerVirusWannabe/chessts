import { createContext, type Dispatch, type SetStateAction } from 'react';
import type {
  AIDifficulty,
  GameMode,
  MoveHistoryEntry,
  Player,
  PromotionPieceName,
  LastMove,
  PieceType,
  SquareType,
} from '../types/chess';

export type BoardContextType = {
  squares: SquareType[];
  isCheck: boolean;
  checkMessage: string | null;
  setSquares: Dispatch<SetStateAction<SquareType[]>>;
  selectedPieceId: string | null;
  highlightedSquares: number[];
  setHighlightedSquares: Dispatch<SetStateAction<number[]>>;
  currentTurn: Player;
  setCurrentTurn: Dispatch<SetStateAction<Player>>;
  capturedPieces: PieceType[];
  setCapturedPieces: Dispatch<SetStateAction<PieceType[]>>;
  handleSquareClick: (index: number) => void;
  handlePieceClick: (id: string, location: number, paths: number[]) => void;
  movePiece: (
    fromIndex: number,
    toIndex: number,
    enPassantSquare?: number,
    promotionPiece?: PromotionPieceName
  ) => void;
  lastMove: LastMove | null;
  setLastMove: Dispatch<SetStateAction<LastMove | null>>;
  kingInCheckSquare: number | null;
  enPassantSquare: number | null;
  setEnPassantSquare: (pos: number | null) => void;
  promotionPawn: { index: number; player: Player } | null;
  setPromotionPawn: Dispatch<SetStateAction<{ index: number; player: Player } | null>>;
  promotePawn: (pieceName: PromotionPieceName) => void;
  humanPlayer: Player | null;
  setHumanPlayer: Dispatch<SetStateAction<Player | null>>;
  aiDifficulty: AIDifficulty;
  setAiDifficulty: Dispatch<SetStateAction<AIDifficulty>>;
  isAiThinking: boolean;
  setGameMode: Dispatch<SetStateAction<GameMode>>;
  gameMode: GameMode;
  createInitialSquares: () => SquareType[];
  moveHistory: MoveHistoryEntry[];
  exportPgn: () => string;
  importPgn: (pgn: string) => void;
  undoMove: () => void;
  redoMove: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetGame: () => void;
};

export const BoardContext = createContext<BoardContextType | undefined>(undefined);
