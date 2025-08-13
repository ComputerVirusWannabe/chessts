import React, { useEffect, useImperativeHandle, useState, useContext } from 'react';
import './App.css';
import { ThemeContext } from './context/ThemeContext';
import { type ChessPiece } from './Board';


type PiecePropsType = {
  id: string;
  color: string; // purely visual
  name: string;
  location: number;
  onPieceClick: (id: string, location: number) => void;
  getAllPiecesFromBoard?: () => { pieces: ChessPiece[], selectedId?: number };
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
  const calculateRookLegitimatePaths = (loc: number) => {
    const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
    const { pieces } = allPieces;
    const moves: number[] = [];

    const currentRow = Math.floor(loc / 8);
    const currentCol = loc % 8;

    const scanDirection = (rowStep: number, colStep: number) => {
      let row = currentRow + rowStep;
      let col = currentCol + colStep;

      while (row >= 0 && row < 8 && col >= 0 && col < 8) {
        const targetPos = row * 8 + col;
        const targetPiece = pieces[targetPos];

        if (targetPiece.name === "Empty") {
          moves.push(targetPos);
        } else {
          if (targetPiece.playerId !== pieces[loc].playerId) {
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

  const calculatePawnLegitimatePaths = (loc: number) => {
    const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
    const { pieces } = allPieces;
    const moves: number[] = [];
  
    const currentRow = Math.floor(loc / 8);
    const currentCol = loc % 8;
  
    // Determine player and direction
    const playerId = pieces[loc]?.playerId;
  
    // Direction: player1 moves down (+1), player2 moves up (-1)
    const direction = playerId === 'player1' ? 1 : -1;
  
    // Starting row for each player
    const startRow = playerId === 'player1' ? 1 : 6;
  
    const forwardOne = loc + direction * 8;
    const forwardTwo = loc + direction * 16;
  
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
      pieces[diagLeft]?.name !== 'Empty' &&
      pieces[diagLeft]?.playerId !== playerId
    ) {
      moves.push(diagLeft);
    }
  
    // Capture diagonally right
    const diagRight = forwardOne + 1;
    if (
      onBoard(diagRight) &&
      Math.floor(diagRight / 8) === currentRow + direction &&
      pieces[diagRight]?.name !== 'Empty' &&
      pieces[diagRight]?.playerId !== playerId
    ) {
      moves.push(diagRight);
    }
  
    setLegitimatePaths(moves);
  };
  

  const calculateLegitimatePaths = (pieceType: string) => {
    if (pieceType === 'Pawn') {
      calculatePawnLegitimatePaths(location);
    } else if (pieceType === 'Rook') {
      calculateRookLegitimatePaths(location);
    }
  };

  useEffect(() => {
    setId(props.id);
    setColor(props.color);
    setName(props.name);
    setLocation(props.location);
    //console.log(" recalculating legitimate paths since props for this piece has change", props.name, "at location", props.location);
    calculateLegitimatePaths(props.name);
  }, [props]);

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
      <button onClick={() => props.onPieceClick(id, location)} style={styles}>
        {name} at {location}
        
      </button>
    </div>
  );
};

export default Piece;
