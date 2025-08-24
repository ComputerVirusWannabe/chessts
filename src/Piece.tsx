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

const Piece: React.FC<PiecePropsType> = (props) => {
  const [legitimatePaths, setLegitimatePaths] = useState<number[]>([]);
  const pieceName = props.name?.toLowerCase() || '';
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
  
    // Use Engine to filter legal moves (checks king safety automatically)
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
  const handleClick = () => {
    const paths = calculateLegitimatePaths();
    boardContext.handlePieceClick(props.id, props.location, paths);
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
  };

  return (
    <div className="card">
      <button onClick={handleClick} style={styles}>
        {props.name}
      </button>
    </div>
  );
};

export default Piece;
