import React, { useEffect, useImperativeHandle, useState, useContext, use } from 'react';
import './App.css';
import { ThemeContext } from './context/ThemeContext';
import type { ChessPiece } from './moveGenerators';

type PlayerPropsType = {
  name: string;
  color: 'black' | 'white';
}

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
const Piece: React.FC<PiecePropsType> = (props) => {
  const [id, setId] = useState<string>(props.id);
  const [color, setColor] = useState<string>(props.color);
  const [name, setName] = useState<string>(props.name);
  const [location, setLocation] = useState<number>(props.location);
  const [legitimatePaths, setLegitimatePaths] = useState<number[]>(); // array of legitimate locations for me to move
  const mytheme = useContext(ThemeContext);
  const [player, setPlayer] = useState<PlayerPropsType>({name: '', color: 'black'});
  const onBoard = (pos: number) => pos >= 0 && pos < 64;  //if (!mytheme) {
   // throw new Error('ThemeContext is not provided');
  //}

  useEffect(() => {
    if (!props.location) {
      console.error('Piece location is not defined');
      return;
    }
    // if initial location is from 1 to 13, set player to player1, else player2
    //const initialPlayer = props.location >= 0 && props.location < 16 'player1'
    if (props.location >= 0 && props.location < 16) {
      setPlayer({ name: 'player1', color: 'black' });
    } else if (props.location >= 48 && props.location < 64) {
      setPlayer({ name: 'player2', color: 'white' });
    } else {
      console.error('Invalid location for player assignment');
      return;
    }

  }, [props.location]);

  const calculateRookLegitimatePaths = (loc: number) => {
    
      const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
      console.log("************ calculateRookLegitimatePaths allPieces :", allPieces);
      const { pieces } = allPieces;
  
      const moves: number[] = [];
      //const loc = props.location;
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

  const calculatePawnLegitimatePaths = (loc : number) => {
    
    console.log("************ calculatePawnLegitimatePaths called with location:", loc);
      const allPieces = props.getAllPiecesFromBoard ? props.getAllPiecesFromBoard() : { pieces: [] };
      const { pieces } = allPieces;
  
      const moves: number[] = [];
      // const loc = props.location;
  
      // Determine direction and starting row based on color
      // Assume board rows: 0-7 top row, 56-63 bottom row
      const forwardStep = player.color === 'black' ? 8 : -8;
      const startRow = player.color === 'black' ? 1 : 6; // rows 0-indexed
      const currentRow = Math.floor(loc / 8);
      const currentCol = loc % 8;
  
      // Forward 1 step if empty
      /*
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
  */
      /*
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
      */
      setLegitimatePaths(moves);
    
  }

  const calculateLegitimatePaths = (pieceType: string) => {
    if (pieceType === 'Pawn') {
      calculatePawnLegitimatePaths(location);
    }
    /*
    else if (pieceType === 'Rook') {
      calculateRookLegitimatePaths(location);
    }
      */
    /*
    else if (pieceType === 'Bishop') {
      // Bishop logic here
      return [location + 9, location - 9, location + 7, location - 7]; // Example moves for bishop
    }
    else if (pieceType === 'Knight') {
      // Knight logic here
      return [location + 17, location - 17, location + 15, location - 15, location + 10, location - 10, location + 6, location - 6]; // Example moves for knight
    }
      */
  }

  useEffect(() => {
    //console.log('Piece useEffect called with props:', props);
    setId(props.id);
    setColor(props.color);
    setName(props.name);
    setLocation(props.location);
    calculateLegitimatePaths(props.name);
    //setLegitimatePaths(props.legitimatePaths ? props.legitimatePaths : calculateLegitimatePaths(props.name));
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
    //fontSize: '1rem',
  };

  return (
    <div className="card">
      <button onClick={() => props.onPieceClick(id, location)} style={styles}>
        {name},{player.color}, At {location}, {legitimatePaths ? `Legit: ${legitimatePaths.join(', ')}` : 'No Legit Moves'}
      </button>
    </div>
  );
};

export default Piece;