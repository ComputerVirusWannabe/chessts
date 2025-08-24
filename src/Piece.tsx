import React, { useEffect, useImperativeHandle, useState, useContext } from 'react';
import { ThemeContext } from './context/ThemeContext';
import { BoardContext } from './context/BoardContext';
import { type PieceType } from './context/BoardContext';
import { generatePseudoLegalMoves } from './moveGenerators';
//import { isSquareAttacked } from './moveGenerators';

export type PiecePropsType = PieceType & {
  //onPieceClick: (id: string, location: number, paths: number[]) => void;
  ref?: React.Ref<any>;
};


export type PieceRefType = {
  getName: () => string;
  getLegitimatePaths: () => number[] | undefined;
};

const Piece: React.FC<PiecePropsType> = (props) => {
  // ----- STATE -----
  //const [id, setId] = useState(props.id);
  //const [name, setName] = useState(props.name);
  
  const [legitimatePaths, setLegitimatePaths] = useState<number[]>();
  const pieceName = props.name ? props.name.toLowerCase() : null;

  const hasMoved = props.hasMoved || false; // Default to false if not provided

  // ----- CONTEXT -----
  const theme = useContext(ThemeContext);
  const boardContext = useContext(BoardContext);
  if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');
  const boardSquares = boardContext.squares;


  //const onBoard = (pos: number) => pos >= 0 && pos < 64;

  // ----- LEGITIMATE MOVES -----
  
  const calculateLegitimatePaths = (): number[] => {
    if (!props.player || !pieceName) {
      setLegitimatePaths([]);
      return [];
    }
  
    // 1. Generate pseudo-legal moves
    const pseudoMoves = generatePseudoLegalMoves(
      props,
      props.location,
      boardSquares
    );
  
    // 2. Special handling for king safety (prevent illegal moves into check)
    let legalMoves: number[];
    if (pieceName === 'king') {
      legalMoves = pseudoMoves.filter(
        (target) =>
          !boardContext.isSquareAttacked(
            target,
            boardContext.opponent(props.player!),
            boardSquares
          )
      );
    } else if (pieceName === 'pawn') {
      // Handle pawn double-step: only allow if starting square hasn't moved
      const startRow = props.player === 'player1' ? 6 : 1;
      legalMoves = pseudoMoves.filter((target) => {
        const row = Math.floor(props.location / 8);
        // if pawn wants to move 2 squares, ensure it's from starting row
        if (Math.abs(target - props.location) === 16 && row !== startRow) {
          return false;
        }
        return true;
      });
    } else {
      // TODO later: simulate move & ensure own king isn’t left in check
      
      legalMoves = pseudoMoves;
    }
  
    setLegitimatePaths(legalMoves);
    return legalMoves;
  };
  

  // Recalculate legitimate moves when relevant state changes
  useEffect(() => {
    calculateLegitimatePaths();
  }, [props.name, props.location, props.player, Piece, boardSquares, hasMoved]);



  // ----- IMPERATIVE HANDLE -----
  useImperativeHandle(props.ref, () => ({
    getName: () => props.name,
    getLegitimatePaths: () => legitimatePaths,
  }));

  // ----- HANDLERS -----
  const handleClick = () => {
    const paths = calculateLegitimatePaths() || []; // Ensure paths is always an array
    //console.log('Clicked piece:', id, 'at props.location:', location, 'paths:', paths);
    //props.onPieceClick?.(id, location, paths);
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
