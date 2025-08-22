import React, { useEffect, useImperativeHandle, useState, useContext } from 'react';
import { ThemeContext } from './context/ThemeContext';
import { BoardContext } from './context/BoardContext';
import { type PieceType } from './context/BoardContext';

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
  const Piece = props.name ? props.name.toLowerCase() : null;
  const hasMoved = props.hasMoved || false; // Default to false if not provided

  // ----- CONTEXT -----
  const theme = useContext(ThemeContext);
  const boardContext = useContext(BoardContext);
  if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');
  const boardSquares = boardContext.squares;


  const onBoard = (pos: number) => pos >= 0 && pos < 64;

  // ----- LEGITIMATE MOVES -----
  const pieceName = props.name ? props.name.toLowerCase() : null;

  const calculatePawnLegitimatePaths = (): number[] => {
    if (!props.player || !pieceName) {
      setLegitimatePaths([]);
      return [];
    }

    const moves: number[] = [];
    const row = Math.floor(props.location / 8);
    const col = props.location % 8;

    // bottom player1 moves up (-8), top player2 moves down (+8)
    const direction = props.player === 'player1' ? -1 : 1;
    const startRow = props.player === 'player1' ? 6 : 1;

    const forwardOne = props.location + direction * 8;
    const forwardTwo = props.location + direction * 16;

    // Forward moves
    if (onBoard(forwardOne) && !boardSquares[forwardOne].piece) {
      moves.push(forwardOne);
      if (!hasMoved && row === startRow && onBoard(forwardTwo) && !boardSquares[forwardTwo].piece) {
        moves.push(forwardTwo);
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const targetCol = col + dc;
      const targetPos = props.location + direction * 8 + dc; // use location here
      if (!onBoard(targetPos) || targetCol < 0 || targetCol > 7) continue;

      const targetPiece = boardSquares[targetPos]?.piece;
      if (targetPiece && targetPiece.player && targetPiece.player !== props.player) {
        moves.push(targetPos);
      }
    }

    setLegitimatePaths(moves);
    return moves; // so clicks get fresh paths
  };


  const calculateRookLegitimatePaths = (): number[] => {
    if (!props.player || !pieceName) {
      setLegitimatePaths([]);
      return [];
    }

    const moves: number[] = [];
    const directions = [-8, 8, -1, 1]; // Up, Down, Left, Right

    for (const direction of directions) {
      let pos = props.location + direction;
      while (onBoard(pos)) {
        const targetPiece = boardSquares[pos]?.piece;
        if (targetPiece) {
          if (targetPiece.player && targetPiece.player !== props.player) {
            moves.push(pos); // Capture
          }
          break; // Stop at first piece
        }
        moves.push(pos);
        pos += direction;
      }
    }

    setLegitimatePaths(moves);
    return moves;
  }

  const calculateKnightLegitimatePaths = (): number[] => {
    if (!props.player || !pieceName) {
      setLegitimatePaths([]);
      return [];
    }
  
    const moves: number[] = [];
    const knightDeltas = [
      [2, 1], [2, -1], [-2, 1], [-2, -1],
      [1, 2], [1, -2], [-1, 2], [-1, -2],
    ];
  
    const row = Math.floor(props.location / 8);
    const col = props.location % 8;
  
    for (const [dr, dc] of knightDeltas) {
      const newRow = row + dr;
      const newCol = col + dc;
  
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetPos = newRow * 8 + newCol;
        const targetPiece = boardSquares[targetPos]?.piece;
        if (!targetPiece || (targetPiece.player && targetPiece.player !== props.player)) {
          moves.push(targetPos);
        }
      }
    }
  
    setLegitimatePaths(moves);
    return moves;
  };
  
  const calculateLegitimatePaths = (): number[] => {
    if (props.name?.toLowerCase() === 'pawn') return calculatePawnLegitimatePaths();
    if (props.name?.toLowerCase() === 'rook') return calculateRookLegitimatePaths();
    if (props.name?.toLowerCase() === 'knight') return calculateKnightLegitimatePaths();
    
    return [];
  };
  

  // ----- EFFECTS -----
  // Update state when props change
  /*
  useEffect(() => {
    //setId(props.id);
    //setName(props.name);
    //setColor(props.color);
    //setPlayer(props.player);
   
  }, [props.id, props.name, props.color, props.player, props.location]);
  */

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
