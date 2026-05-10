import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import PromotionDialog from '../components/PromotionDialog';
import { chooseBestMove } from '../ai/search';
import { BoardContext } from './board-context';
import { cloneCapturedPieces, cloneGameSnapshot, cloneLastMove, cloneMoveHistory, cloneSquares, createInitialGameSnapshot, createInitialSquares } from '../engine/boardState';
import { applyLegalMove, getLegalMoves } from '../engine/game';
import { exportPgn, importPgn as importPgnSnapshots } from '../engine/pgn';
import type { AIDifficulty, GameMode, GameSnapshot, Player, PromotionPieceName } from '../types/chess';

const AI_MOVE_DELAY_MS = 60;

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialSnapshot = useMemo(() => createInitialGameSnapshot(), []);

  const [squares, setSquares] = useState(() => cloneSquares(initialSnapshot.squares));
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<number[]>([]);
  const [capturedPieces, setCapturedPieces] = useState(() => cloneCapturedPieces(initialSnapshot.capturedPieces));
  const [enPassantSquare, setEnPassantSquare] = useState<number | null>(initialSnapshot.enPassantSquare);
  const [lastMove, setLastMove] = useState(() => cloneLastMove(initialSnapshot.lastMove));
  const [humanPlayer, setHumanPlayer] = useState<Player | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<Player>(initialSnapshot.currentTurn);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [kingInCheckSquare, setKingInCheckSquare] = useState<number | null>(initialSnapshot.kingInCheckSquare);
  const [moveHistory, setMoveHistory] = useState(() => cloneMoveHistory(initialSnapshot.moveHistory));
  const [promotionPawn, setPromotionPawn] = useState<{ index: number; player: Player } | null>(null);
  const [pendingPromotionMove, setPendingPromotionMove] = useState<{ from: number; to: number } | null>(null);
  const [historySnapshots, setHistorySnapshots] = useState<GameSnapshot[]>(() => [cloneGameSnapshot(initialSnapshot)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isNavigatingHistory, setIsNavigatingHistory] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const isCheck = kingInCheckSquare !== null;
  const checkMessage = isCheck ? "King is in check!" : null;

  const currentSnapshot = useMemo<GameSnapshot>(
    () => ({
      squares,
      capturedPieces,
      currentTurn,
      enPassantSquare,
      lastMove,
      kingInCheckSquare,
      moveHistory,
    }),
    [capturedPieces, currentTurn, enPassantSquare, kingInCheckSquare, lastMove, moveHistory, squares]
  );

  const restoreSnapshot = useCallback((snapshot: GameSnapshot) => {
    setSquares(cloneSquares(snapshot.squares));
    setCapturedPieces(cloneCapturedPieces(snapshot.capturedPieces));
    setCurrentTurn(snapshot.currentTurn);
    setEnPassantSquare(snapshot.enPassantSquare);
    setLastMove(cloneLastMove(snapshot.lastMove));
    setKingInCheckSquare(snapshot.kingInCheckSquare);
    setMoveHistory(cloneMoveHistory(snapshot.moveHistory));
    setSelectedPieceId(null);
    setHighlightedSquares([]);
    setPromotionPawn(null);
    setPendingPromotionMove(null);
  }, []);

  const pushSnapshot = useCallback(
    (snapshot: GameSnapshot) => {
      restoreSnapshot(snapshot);
      setHistorySnapshots(previousSnapshots => [
        ...previousSnapshots.slice(0, historyIndex + 1),
        cloneGameSnapshot(snapshot),
      ]);
      setHistoryIndex(historyIndex + 1);
    },
    [historyIndex, restoreSnapshot]
  );

  const finishMove = useCallback(
    (fromIndex: number, toIndex: number, promotionPiece?: PromotionPieceName) => {
      const legalMoves = getLegalMoves(currentSnapshot.squares, currentSnapshot.currentTurn, currentSnapshot.enPassantSquare);
      const selectedMove = legalMoves.find(
        move =>
          move.from === fromIndex &&
          move.to === toIndex &&
          (promotionPiece ? move.promotion === promotionPiece : true)
      );

      if (!selectedMove) {
        return;
      }

      if (selectedMove.promotion && !promotionPiece) {
        setPromotionPawn({
          index: toIndex,
          player: selectedMove.piece.player as Player,
        });
        setPendingPromotionMove({ from: fromIndex, to: toIndex });
        setSelectedPieceId(null);
        setHighlightedSquares([]);
        return;
      }

      const { snapshot, isCheckmate, isStalemate } = applyLegalMove(currentSnapshot, selectedMove, legalMoves);
      pushSnapshot(snapshot);

      setTimeout(() => {
        if (isCheckmate) {
          alert(`${snapshot.currentTurn} is checkmated!`);
          setGameOver(true);
        } else if (isStalemate) {
          alert('Stalemate!');
          setGameOver(true);
        }
      }, 0);
    },
    [currentSnapshot, pushSnapshot]
  );

  const movePiece = useCallback(
    (fromIndex: number, toIndex: number, _ignoredEnPassantSquare?: number, promotionPiece?: PromotionPieceName) => {
      if (!currentSnapshot.squares[fromIndex]?.piece) {
        return;
      }

      finishMove(fromIndex, toIndex, promotionPiece);
    },
    [currentSnapshot.squares, finishMove]
  );

  const promotePawn = useCallback(
    (pieceName: PromotionPieceName) => {
      if (!pendingPromotionMove) {
        return;
      }

      const pendingMove = pendingPromotionMove;
      setPromotionPawn(null);
      setPendingPromotionMove(null);
      finishMove(pendingMove.from, pendingMove.to, pieceName);
    },
    [finishMove, pendingPromotionMove]
  );

  useEffect(() => {
    if (!humanPlayer || gameMode !== 'human-vs-ai' || promotionPawn || isNavigatingHistory || gameOver) {
      setIsAiThinking(false);
      return;
    }

    const aiPlayer: Player = humanPlayer === 'player1' ? 'player2' : 'player1';
    if (currentTurn !== aiPlayer) {
      setIsAiThinking(false);
      return;
    }

    const depthByDifficulty: Record<AIDifficulty, number> = {
      easy: 1,
      medium: 2,
      hard: 3,
    };

    setIsAiThinking(true);

    const timerId = setTimeout(() => {
      try {
        const move = chooseBestMove(squares, aiPlayer, depthByDifficulty[aiDifficulty]);
        if (!move) {
          return;
        }

        finishMove(move.from, move.to, move.isPromotion ? move.promote ?? 'queen' : undefined);
      } finally {
        setIsAiThinking(false);
      }
    }, AI_MOVE_DELAY_MS);

    return () => {
      clearTimeout(timerId);
    };
  }, [aiDifficulty, currentTurn, finishMove, gameMode, gameOver, humanPlayer, promotionPawn, squares, isNavigatingHistory, setIsAiThinking]);

  const resetGame = useCallback(() => {
    const snapshot = createInitialGameSnapshot();
    restoreSnapshot(snapshot);
    setHumanPlayer(null);
    setAiDifficulty('medium');
    setIsAiThinking(false);
    setGameMode(null);
    setHistorySnapshots([cloneGameSnapshot(snapshot)]);
    setHistoryIndex(0);
    setGameOver(false);
  }, [restoreSnapshot]);

  const undoMove = useCallback(() => {
    if (gameOver) {
      return;
    }
  
    if (historyIndex === 0) {
      return;
    }
  
    setIsNavigatingHistory(true);

    let steps = 1;
    if (gameMode === 'human-vs-ai' && humanPlayer) {
      let targetIndex = historyIndex;
      for (let index = historyIndex - 1; index >= 0; index -= 1) {
        targetIndex = index;
        if (historySnapshots[index].currentTurn === humanPlayer || index === 0) {
          break;
        }
      }
      steps = Math.max(1, historyIndex - targetIndex);
    }

    const nextIndex = Math.max(0, historyIndex - steps);
  
    restoreSnapshot(historySnapshots[nextIndex]);
    setHistoryIndex(nextIndex);
  
    setTimeout(() => {
      setIsNavigatingHistory(false);
    }, 0);
  }, [
    gameOver,
    gameMode,
    humanPlayer,
    historyIndex,
    historySnapshots,
    restoreSnapshot
  ]);

  const redoMove = useCallback(() => {
    if (gameOver) {
      return;
    }
  
    if (historyIndex >= historySnapshots.length - 1) {
      return;
    }
  
    setIsNavigatingHistory(true);

    let steps = 1;
    if (gameMode === 'human-vs-ai' && humanPlayer) {
      let targetIndex = historyIndex;
      for (let index = historyIndex + 1; index < historySnapshots.length; index += 1) {
        targetIndex = index;
        if (historySnapshots[index].currentTurn === humanPlayer || index === historySnapshots.length - 1) {
          break;
        }
      }
      steps = Math.max(1, targetIndex - historyIndex);
    }

    const nextIndex = Math.min(
      historySnapshots.length - 1,
      historyIndex + steps
    );
  
    restoreSnapshot(historySnapshots[nextIndex]);
    setHistoryIndex(nextIndex);
  
    setTimeout(() => {
      setIsNavigatingHistory(false);
    }, 0);
  }, [
    gameOver,
    gameMode,
    humanPlayer,
    historyIndex,
    historySnapshots,
    restoreSnapshot
  ]);

  const exportCurrentPgn = useCallback(() => exportPgn(currentSnapshot), [currentSnapshot]);

  const importPgn = useCallback(
    (pgn: string) => {
      const importedSnapshots = importPgnSnapshots(pgn);
      const latestSnapshot = importedSnapshots[importedSnapshots.length - 1];

      restoreSnapshot(latestSnapshot);
      setGameMode('human-vs-human');
      setHumanPlayer(null);
      setIsAiThinking(false);
      setHistorySnapshots(importedSnapshots.map(snapshot => cloneGameSnapshot(snapshot)));
      setHistoryIndex(importedSnapshots.length - 1);
      setGameOver(false);
    },
    [restoreSnapshot]
  );

  const handleSquareClick = (toIndex: number) => {
    if (gameMode === 'human-vs-ai' && currentTurn !== humanPlayer) {
      return;
    }

    const clickedSquare = squares[toIndex];
    const clickedPiece = clickedSquare.piece;
    const fromIndex = squares.findIndex(square => square.piece?.id === selectedPieceId);

    if (fromIndex === -1) {
      if (!clickedPiece || clickedPiece.player !== currentTurn) {
        return;
      }

      const legalMoves = getLegalMoves(squares, currentTurn, enPassantSquare).filter(move => move.from === toIndex);
      if (!legalMoves.length) {
        return;
      }

      setSelectedPieceId(clickedPiece.id);
      setHighlightedSquares([...new Set(legalMoves.map(move => move.to))]);
      return;
    }

    const selectedPiece = squares[fromIndex].piece;
    if (!selectedPiece) {
      setSelectedPieceId(null);
      setHighlightedSquares([]);
      return;
    }

    const legalMoves = getLegalMoves(squares, currentTurn, enPassantSquare).filter(move => move.from === fromIndex);
    if (!legalMoves.some(move => move.to === toIndex)) {
      setSelectedPieceId(null);
      setHighlightedSquares([]);
      return;
    }

    movePiece(fromIndex, toIndex, enPassantSquare ?? undefined);
    setSelectedPieceId(null);
    setHighlightedSquares([]);
  };

  const handlePieceClick = (id: string, _location: number, paths: number[]) => {
    const piece = squares.find(square => square.piece?.id === id)?.piece;
    if (!piece || piece.player !== currentTurn) {
      return;
    }

    setSelectedPieceId(id);
    setHighlightedSquares(paths);
  };

  return (
    <BoardContext.Provider
      value={{
        squares,
        setSquares,
        isCheck,
        checkMessage,
        selectedPieceId,
        highlightedSquares,
        setHighlightedSquares,
        currentTurn,
        setCurrentTurn,
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
        aiDifficulty,
        setAiDifficulty,
        isAiThinking,
        setGameMode,
        gameMode,
        createInitialSquares,
        moveHistory,
        exportPgn: exportCurrentPgn,
        importPgn,
        undoMove,
        redoMove,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < historySnapshots.length - 1,
        resetGame,
      }}
    >
      {children}
      {promotionPawn ? <PromotionDialog onSelect={promotePawn} /> : null}
    </BoardContext.Provider>
  );
};
