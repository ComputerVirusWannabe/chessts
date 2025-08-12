import React, { useEffect, useImperativeHandle, useState, useContext, use } from 'react';
import './App.css';
import { ThemeContext } from './context/ThemeContext';
import type { ChessPiece } from './moveGenerators';


type PiecePropsType = {
  id: string;
  color: string;
  name: string;
  location: number;
  legitimatePaths?: number[];
  onPieceClick: (id: string, location: number) => void;
  getAllPiecesFromBoard?: () => { pieces: ChessPiece[], selectedId?: number};
  ref?: React.Ref<any>;


};

export type PieceRefType = {
  getName: () => string;
  getLegitimatePaths: () => number[] | undefined;
};

//const Piece: React.FC<PieceProps> = forwardRef((props, ref) => {
const PieceSave: React.FC<PiecePropsType> = (props) => {
  const [id, setId] = useState<string>(props.id);
  const [color, setColor] = useState<string>(props.color);
  const [name, setName] = useState<string>(props.name);
  const [location, setLocation] = useState<number>(props.location);
  const [legitimatePaths, setLegitimatePaths] = useState<number[]>(); // array of legitimate locations for me to move
  const mytheme = useContext(ThemeContext);
  const onBoard = (pos: number) => pos >= 0 && pos < 64;  //if (!mytheme) {
   // throw new Error('ThemeContext is not provided');
  //}


  const calculateRookLegitimatePaths = (loc: number) => {
 
  }

  const calculateLegitimatePaths = (pieceType: string) => {
    if (pieceType === 'Pawn') {
      // Pawn logic here
      // This is just a placeholder, actual logic will depend on the game rules
      return [location + 8, location + 16]; // Example moves for pawn
    }
    else if (pieceType === 'Rook') {
      // Rook logic here
      calculateRookLegitimatePaths(location);
     // return [location + 1, location - 1, location + 8, location - 8]; // Example moves for rook
    }
    else if (pieceType === 'Bishop') {
      // Bishop logic here
      return [location + 9, location - 9, location + 7, location - 7]; // Example moves for bishop
    }
    else if (pieceType === 'Knight') {
      // Knight logic here
      return [location + 17, location - 17, location + 15, location - 15, location + 10, location - 10, location + 6, location - 6]; // Example moves for knight
    }
  }

      // King logic here    


  useEffect(() => {
    //console.log('Board in Piece useEffect:', props.board.map((p) => p.name));
    setId(props.id);
    setName(props.name);
    setColor(props.color);
    setLocation(props.location);

    if (props.name === 'Pawn') {
    const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
    const { pieces } = allPieces;

    const moves: number[] = [];
    const loc = props.location;

    // Determine direction and starting row based on color
    // Assume board rows: 0-7 top row, 56-63 bottom row
    const forwardStep = props.color === 'red' ? 8 : -8;
    const startRow = props.color === 'red' ? 1 : 6; // rows 0-indexed
    const currentRow = Math.floor(loc / 8);
    const currentCol = loc % 8;

    // Forward 1 step if empty
    const forwardOne = loc + forwardStep;
    if (onBoard(forwardOne) && pieces[forwardOne]?.name === 'Empty') {
      moves.push(forwardOne);

      // Forward 2 steps if at starting row and both squares empty
      const forwardTwo = loc + 2 * forwardStep;
      if (
        currentRow === startRow &&
        onBoard(forwardTwo) &&
        pieces[forwardTwo].name === 'Empty'
      ) {
        moves.push(forwardTwo);
      }
    }

    // Capture diagonally left
    const diagLeft = forwardOne - 1;
    if (
      onBoard(diagLeft) &&
      Math.floor(diagLeft / 8) === currentRow + (props.color === 'red' ? 1 : -1) &&
      pieces[diagLeft]?.name !== 'Empty' &&
      pieces[diagLeft]?.color !== props.color
    ) {
      moves.push(diagLeft);
    }

    // Capture diagonally right
    const diagRight = forwardOne + 1;
    if (
      onBoard(diagRight) &&
      Math.floor(diagRight / 8) === currentRow + (props.color === 'red' ? 1 : -1) &&
      pieces[diagRight].name !== 'Empty' &&
      pieces[diagRight].color !== props.color
    ) {
      moves.push(diagRight);
    }
    

    setLegitimatePaths(moves);
  }

  }, [props]);

  useEffect(() => {
    if (props.name === "Rook") {
      const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
      const { pieces } = allPieces;
  
      const moves: number[] = [];
      const loc = props.location;
      const currentRow = Math.floor(loc / 8);
      const currentCol = loc % 8;
  
      // Helper: scan in a direction until blocked
      const scanDirection = (rowStep: number, colStep: number) => {
        let row = currentRow + rowStep;
        let col = currentCol + colStep;
  
        while (row >= 0 && row < 8 && col >= 0 && col < 8) {
          const targetPos = row * 8 + col;
          const targetPiece = pieces[targetPos];
  
          if (targetPiece.name === "Empty") {
            moves.push(targetPos);
          } else {
            if (targetPiece.color !== props.color) {
              moves.push(targetPos); // can capture
            }
            break; // stop scanning after hitting *any* piece
          }
  
          row += rowStep;
          col += colStep;
        }
      };
  
      // Scan in all 4 rook directions
      scanDirection(0, 1);   // right
      scanDirection(0, -1);  // left
      scanDirection(1, 0);   // down
      scanDirection(-1, 0);  // up
  
      setLegitimatePaths(moves);
    }
  }, [props]);

  useEffect(() => {
    if (props.name === "Bishop") {
      const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
      const { pieces } = allPieces;
  
      const moves: number[] = [];
      const loc = props.location;
      const currentRow = Math.floor(loc / 8);
      const currentCol = loc % 8;
  
      // Helper: scan diagonally in a direction until blocked
      const scanDiagonal = (rowStep: number, colStep: number) => {
        let row = currentRow + rowStep;
        let col = currentCol + colStep;
  
        while (row >= 0 && row < 8 && col >= 0 && col < 8) {
          const targetPos = row * 8 + col;
          const targetPiece = pieces[targetPos];
  
          if (targetPiece.name === "Empty") {
            moves.push(targetPos);
          } else {
            if (targetPiece.color !== props.color) {
              moves.push(targetPos); // can capture
            }
            break; // stop scanning after hitting *any* piece
          }
  
          row += rowStep;
          col += colStep;
        }
      };
  
      // Scan in all 4 bishop diagonal directions
      scanDiagonal(1, 1);   // down-right
      scanDiagonal(1, -1);  // down-left
      scanDiagonal(-1, 1);  // up-right
      scanDiagonal(-1, -1); // up-left
  
      setLegitimatePaths(moves);
    }
  }, [props]);

  useEffect(() => {
    if (props.name === "Knight") {
      const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
      const { pieces } = allPieces;
  
      const moves: number[] = [];
      const loc = props.location;
      const currentRow = Math.floor(loc / 8);
      const currentCol = loc % 8;
  
      // Knight moves (L-shape)
      const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
      ];
  
      for (const [rowStep, colStep] of knightMoves) {
        const newRow = currentRow + rowStep;
        const newCol = currentCol + colStep;
  
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const targetPos = newRow * 8 + newCol;
          const targetPiece = pieces[targetPos];
  
          if (targetPiece.name === "Empty" || targetPiece.color !== props.color) {
            moves.push(targetPos); // can move or capture
          }
        }
      }
  
      setLegitimatePaths(moves);
    }
  }, [props]);
  

  useImperativeHandle(props.ref, () => ({
    getName: () => props.name,
    getLegitimatePaths: () => { 
      //console.log('getLegitimatePaths called all pieces are: ', props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : 'No pieces available');
      return legitimatePaths
    },
  }));

  const styles: React.CSSProperties = {
    backgroundColor: color,
    color: mytheme?.theme === 'dark' ? 'white' : 'black',

    width: '100%',
    height: '100%',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
  };

  return (
    <div className="card">
      <button onClick={() => props.onPieceClick(id, location)} style={styles}>
        {name}, {id} At {location}
      </button>
    </div>
  );
};

export default PieceSave;