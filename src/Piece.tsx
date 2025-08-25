import React, { useEffect, useImperativeHandle, useState, useContext } from 'react';
import { ThemeContext } from './context/ThemeContext';
import { BoardContext } from './context/BoardContext';
import { type PieceType } from './context/BoardContext';
import { generatePseudoLegalMoves } from './moveGenerators';
import * as Engine from './engine';

export type PiecePropsType = PieceType & {
  ref?: React.Ref<any>;
};

export type PieceRefType = {
  getName: () => string;
  getLegitimatePaths: () => number[];
};
const pieceSymbols: Record<string, string> = {
  pawn: '♟',     // player1
  rook: '♜',
  knight: '♞',
  bishop: '♝',
  queen: '♛',
  king: '♚'
};

const pieceSymbolsWhite: Record<string, string> = {
  pawn: '♙',     // player2
  rook: '♖',
  knight: '♘',
  bishop: '♗',
  queen: '♕',
  king: '♔'
};

const Piece: React.FC<PiecePropsType> = (props) => {
  const [legitimatePaths, setLegitimatePaths] = useState<number[]>([]);
  const pieceName = props.name || '';
  const hasMoved = props.hasMoved || false;

  const theme = useContext(ThemeContext);
  const boardContext = useContext(BoardContext);
  if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');
  const boardSquares = boardContext.squares;

  // ----- LEGITIMATE MOVES -----
  const calculateLegitimatePaths = (): number[] => {
    if (!props.player || !props.name) {
      setLegitimatePaths([]);
      return [];
    }

    const pseudoMoves = generatePseudoLegalMoves(props, props.location, boardSquares);

    // Castling logic for the king
    if (pieceName === 'king' && !hasMoved) {
      const castlingMoves = Engine.calculateCastlingMoves(props, boardSquares);
      pseudoMoves.push(...castlingMoves);
    }

    const legalMoves = Engine.filterLegalMoves(props, props.location, pseudoMoves, boardSquares);

    setLegitimatePaths(legalMoves);
    return legalMoves;
  };

  useEffect(() => {
    calculateLegitimatePaths();
  }, [props.name, props.location, props.player, boardSquares, hasMoved]);

  // ----- IMPERATIVE HANDLE -----
  useImperativeHandle(props.ref, () => ({
    getName: () => props.name,
    getLegitimatePaths: () => legitimatePaths,
  }));

  // ----- HANDLER -----
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent double firing if parent also has onClick
    if (!boardContext) return;
    boardContext.handleSquareClick(props.location);
  };

  // ----- STYLES -----
  const styles: React.CSSProperties = {
    backgroundColor: props.color,
    color: theme?.theme === 'dark' ? 'white' : 'black',
    width: '100%',
    height: '100%',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    fontSize: '2rem',        // scale symbol nicely
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,              // <-- prevent button from overflowing
    boxSizing: 'border-box', // <-- keeps it inside parent
  };
  

  return (
    <div className="card">
      <button onClick={handleClick} style={styles}>
        {props.player === 'player1' 
          ? pieceSymbols[props.name] 
          : pieceSymbolsWhite[props.name]}
      </button>
    </div>
  );
};

export default Piece;
