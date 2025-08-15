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
  pieces?: ChessPiece[];
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
/*
  const calculateRookLegitimatePaths = () => {
    //const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
    //const { pieces } = allPieces;
    const moves: number[] = [];

    const currentRow = Math.floor(location / 8);
    const currentCol = location % 8;

    const scanDirection = (rowStep: number, colStep: number) => {
      let row = currentRow + rowStep;
      let col = currentCol + colStep;

      while (row >= 0 && row < 8 && col >= 0 && col < 8) {
        const targetPos = row * 8 + col;
        const targetPiece = props.pieces?[targetPos]

        if (targetPiece.name === "Empty") {
          moves.push(targetPos);
        } else {
          if (targetPiece.playerId !== props.pieces?[location].player) {
            moves.push(targetPos); // capture
          }
          break; // blocked
        }

        row += rowStep;
        col += colStep;
      }
    };

    scanDirection(0, 1);   // right
    scanDirection(0, -1);  // left
    scanDirection(1, 0);   // down
    scanDirection(-1, 0);  // up

    setLegitimatePaths(moves);
  };
*/
const calculatePawnLegitimatePaths = () => {
   const moves: number[] = [];
    const currentRow = Math.floor(location / 8);  // the row of this piece
    const currentCol = location % 8; // the column of this piece
    //const playerId = props.pieces ? props.pieces[location].player : 'none'; // get player from pieces array
    const direction = player === 'player1' ? 1 : -1; // player1 moves down, player2 moves up
    const startRow = player === 'player1' ? 1 : 6; // starting row for each player
    const forwardOne = location + direction * 8; // one square forward
    const forwardTwo = location + direction * 16; // two squares forward
    // Move forward one square
    if (onBoard(forwardOne) && props.pieces && props.pieces[forwardOne]?.name === 'Empty') {
      moves.push(forwardOne);

      // Move forward two squares from starting row
      if (currentRow === startRow && onBoard(forwardTwo) && props.pieces[forwardTwo]?.name === 'Empty') {
        moves.push(forwardTwo);
      }
    }
    // Capture diagonally left
    const diagLeft = forwardOne - 1;
    if (
      onBoard(diagLeft) &&
      Math.floor(diagLeft / 8) === currentRow + direction &&
      props.pieces && props.pieces[diagLeft]?.name !== 'Empty' &&
      props.pieces[diagLeft]?.player !== player
    ) {
      moves.push(diagLeft);
    }
    // Capture diagonally right
    const diagRight = forwardOne + 1;
    if (
      onBoard(diagRight) &&
      Math.floor(diagRight / 8) === currentRow + direction &&
      props.pieces && props.pieces[diagRight]?.name !== 'Empty' &&
      props.pieces[diagRight]?.player !== player
    ) {
      moves.push(diagRight);
    }
    console.log("In UseEffect: &&&&&&&&& Pawn update moves for ", id, 'to ', moves);
    setLegitimatePaths(moves);
}
/*
  const calculatePawnLegitimatePaths = () => {
    //const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
    const pieces = props.pieces 
    const moves: number[] = [];
  
    const currentRow = Math.floor(location / 8);
    const currentCol = location % 8;
  
    // Determine player and direction
    const playerId = pieces?[location].player
  
    // Direction: player1 moves down (+1), player2 moves up (-1)
    const direction = playerId === 'player1' ? 1 : -1;
  
    // Starting row for each player
    const startRow = playerId === 'player1' ? 1 : 6;
  
    const forwardOne = location + direction * 8;
    const forwardTwo = location + direction * 16;
  
    // Move forward one square
    if (onBoard(forwardOne) && pieces[forwardOne]?.name === 'Empty') {
      moves.push(forwardOne);
  
      // Move forward two squares from starting row
      if (currentRow === startRow && onBoard(forwardTwo) && pieces[forwardTwo]?.name === 'Empty') {
        moves.push(forwardTwo);
      }
    }
  
    // Capture diagonally left
    const diagLeft = forwardOne - 1;
    if (
      onBoard(diagLeft) &&
      Math.floor(diagLeft / 8) === currentRow + direction &&
      pieces?[diagLeft]
      pieces[diagLeft]?.player !== player
    ) {
      moves.push(diagLeft);
    }
  
    // Capture diagonally right
    const diagRight = forwardOne + 1;
    if (
      onBoard(diagRight) &&
      Math.floor(diagRight / 8) === currentRow + direction &&
      pieces?[diagRight] !== 'Empty' &&
      pieces[diagRight]?.player !== player
    ) {
      moves.push(diagRight);
    }
  
    setLegitimatePaths(moves);
  };
  */

  const calculateLegitimatePaths = (pieceType: string) => {
    calculatePawnLegitimatePaths();
    //if (pieceType === 'Pawn') {
    //  calculatePawnLegitimatePaths();
   // } else if (pieceType === 'Rook') {
   //   calculateRookLegitimatePaths();
  //  }
  };

  useEffect(() => {
    //console.log("USE ******** EFFECT Piece,  props changed:", props);
    setId(props.id);
    setColor(props.color);
    setName(props.name);
    setLocation(props.location);
    //console.log(" recalculating legitimate paths since props for this piece has change", props.name, "at location", props.location);
    calculateLegitimatePaths(props.name);
  }, [props.id, props.color, props.name, props.location]);

  /*
type PiecePropsType = {
  id: string;
  color: string; // purely visual
  name: string;
  location: number;
  legitimatePaths?: number[];
  onPieceClick: (id: string, location: number) => void;
  getAllPiecesFromBoard?: () => { pieces: ChessPiece[], selectedId?: number };
  ref?: React.Ref<any>;
};
  */

/*
                id={piece.id}
                name={piece.name}
                color={piece.color}
                location={index}
                onPieceClick={handlePieceClick}
                getAllPiecesFromBoard={getPieces}
                ref={(el) => (arrayOfChildRefs.current[index] = el)}
*/

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
// {legitimatePaths ? `Legit: ${legitimatePaths.join(', ')}` : 'No Legit Moves'}
  return (
    <div className="card">
      <button onClick={handleClick} style={styles}>
        {name} {id} at {location}
        
      </button>
    </div>
  );
};

export default Piece;
