import React, { useContext, useEffect, useImperativeHandle, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { BoardContext } from '../context/board-context';
import { generatePseudoLegalMoves } from '../engine/moveGenerators';
import * as Engine from '../engine/logic';
import { pieceSymbolsBlack, pieceSymbolsWhite } from './pieceSymbols';
import type { PieceType } from '../types/chess';

export type PiecePropsType = PieceType & {
  ref?: React.Ref<{ getName: () => string; getLegitimatePaths: () => number[] }>;
};

const Piece: React.FC<PiecePropsType> = props => {
  const [legitimatePaths, setLegitimatePaths] = useState<number[]>([]);
  const pieceName = props.name;
  const hasMoved = props.hasMoved ?? false;

  const theme = useContext(ThemeContext);
  const boardContext = useContext(BoardContext);
  if (!boardContext) {
    throw new Error('BoardContext must be used within a BoardProvider');
  }

  const { squares: boardSquares, enPassantSquare } = boardContext;

  useEffect(() => {
    if (!props.player) {
      setLegitimatePaths([]);
      return;
    }

    const pseudoMoves = generatePseudoLegalMoves(props, props.location, boardSquares, enPassantSquare ?? undefined);
    if (pieceName === 'king' && !hasMoved) {
      pseudoMoves.push(...Engine.calculateCastlingMoves(props, boardSquares));
    }

    const legalMoves = Engine.filterLegalMoves(
      props,
      props.location,
      pseudoMoves,
      boardSquares,
      enPassantSquare ?? undefined
    );

    setLegitimatePaths(legalMoves);
  }, [boardSquares, enPassantSquare, hasMoved, pieceName, props]);

  useImperativeHandle(props.ref, () => ({
    getName: () => props.name,
    getLegitimatePaths: () => legitimatePaths,
  }));

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    boardContext.handleSquareClick(props.location);
  };

  const styles: React.CSSProperties = {
    backgroundColor: props.color,
    color: theme?.theme === 'dark' ? 'orange' : 'black',
    width: '100%',
    height: '100%',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    fontSize: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    boxSizing: 'border-box',
  };

  return (
    <div className="card">
      <button onClick={handleClick} style={styles}>
        {props.player === 'player1' ? pieceSymbolsWhite[props.name] : pieceSymbolsBlack[props.name]}
      </button>
    </div>
  );
};

export default Piece;
