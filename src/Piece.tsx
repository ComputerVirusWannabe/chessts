import React, { useEffect, useImperativeHandle, useState, useContext } from 'react';
import './App.css';
import { ThemeContext } from './context/ThemeContext';
import { type ChessPiece } from './Board';


type PiecePropsType = {
  id: string;
  color: string; // purely visual
  name: string;
  location: number;
  player?: 'player1' | 'player2' | null; // game logic
  board: ChessPiece[];
  onPieceClick: (id: string, location: number) => void;
 // getAllPiecesFromBoard?: () => { pieces: ChessPiece[], selectedId?: number };
  ref?: React.Ref<any>;
};

export type PieceRefType = {
  getName: () => string;
  getLegitimatePaths: () => number[] | undefined;
};

const Piece: React.FC<PiecePropsType> = (props) => {
  const [id, setId] = useState(props.id);
  const [color, setColor] = useState(props.color); // purely visual
  const [name, setName] = useState(props.name);
  const [player, setPlayer] = useState(props.player); // game logic
  const [location, setLocation] = useState(props.location);
  const [legitimatePaths, setLegitimatePaths] = useState<number[]>();
 
 
  const mytheme = useContext(ThemeContext);



  const onBoard = (pos: number) => pos >= 0 && pos < 64;
/*
  // Assign player based on starting location
  useEffect(() => {
    if (props.location >= 0 && props.location < 16) {
      
    } else if (props.location >= 48 && props.location < 64) {
      ;
    } else {
      console.error('Invalid location for player assignment');
    }
  }, [props.location]);
*/

const calculatePawnLegitimatePaths = () => {
   const moves: number[] = [];
    const currentRow = Math.floor(location / 8);  // the row of this piece
    const currentCol = location % 8; // the column of this piece
    if (player !== 'player1' && player !== 'player2') {
      setLegitimatePaths([]);
      return; // Don't calculate for non-pawns or empty squares
    }
    const direction = player === 'player1' ? 1 : -1; // player1 moves down, player2 moves up
    const startRow = player === 'player1' ? 1 : 6; // starting row for each player
    const forwardOne = location + direction * 8; // one square forward
    const forwardTwo = location + direction * 16; // two squares forward
    // Move forward one square
    if (onBoard(forwardOne) && props.board && props.board[forwardOne]?.name === 'Empty') {
      moves.push(forwardOne);

      // Move forward two squares from starting row
      if (!props.board[location]?.hasMoved && onBoard(forwardTwo) && props.board[forwardTwo]?.name === 'Empty') {
        moves.push(forwardTwo);
      }      
    }
     // Capture diagonals
    const diagLeft = forwardOne - 1;
    if (
      onBoard(diagLeft) &&
      Math.floor(diagLeft / 8) === currentRow + direction && // ensures it’s actually diagonal
      props.board?.[diagLeft]?.name !== 'Empty' &&
      props.board?.[diagLeft]?.player !== player
    ) {
      moves.push(diagLeft);
    }
    
    const diagRight = forwardOne + 1;
    if (
      onBoard(diagRight) &&
      Math.floor(diagRight / 8) === currentRow + direction && // ensures it’s actually diagonal
      props.board?.[diagRight]?.name !== 'Empty' &&
      props.board?.[diagRight]?.player !== player
    ) {
      moves.push(diagRight);
    }
      console.log("In UseEffect: &&&&&&&&& Pawn update moves for ", id, 'to ', moves);
      setLegitimatePaths(moves);
  }





  const calculateLegitimatePaths = (pieceType: string) => {
    if (pieceType === 'Pawn') {
      calculatePawnLegitimatePaths(); // already sets legitimatePaths
    }
  };

  useEffect(() => {
    //console.log("USE ******** EFFECT Piece,  props changed:", props);
    setId(props.id);
    setColor(props.color);
    setName(props.name);
    setPlayer(props.player);
    //setLegitimatePaths(undefined);
    setLocation(props.location);
    //console.log(" recalculating legitimate paths since props for this piece has change", props.name, "at location", props.location);
    //calculateLegitimatePaths(props.name);
  }, [props.id, props.color, props.name, props.location, props.player, props.onPieceClick]);

  useEffect(() => {
    // Only recalc if this piece’s location or type changes
    calculateLegitimatePaths(props.name);
  }, [props.name, props.location, props.board]);


  const handleClick = () => {
    console.log('in PieceComponent, Clicked piece:', id, 'at location:', location);
    
    props.onPieceClick(id, location);
  }

  useImperativeHandle(props.ref, () => ({
    getName: () => props.name,
    getLegitimatePaths: () => legitimatePaths
  }));

  const styles: React.CSSProperties = {
    backgroundColor: color, // purely visual
    color: mytheme?.theme === 'dark' ? 'white' : 'black',
    width: '100%',
    height: '100%',
    border: 'none',
    fontWeight: 'bold'
  };
  
  return (
    <div className="card">
      <button onClick={handleClick} style={styles}>
        {name} {id} at {location}
        
      </button>
    </div>
  );
};

export default Piece;
