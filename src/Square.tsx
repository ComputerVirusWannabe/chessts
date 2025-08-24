import React, { useContext } from 'react';
import { BoardContext } from './context/BoardContext';
import Piece from './Piece';
import { ThemeContext } from './context/ThemeContext';
import { type PieceType } from './context/BoardContext';

type SquarePropsType = {
    index: number;
    //onPieceClick?: (id: string, location: number, paths: number[]) => void;
  } & PieceType;
  

  const Square: React.FC<SquarePropsType> = ({ index, id, name, color, player, hasMoved }) => {
    const boardContext = useContext(BoardContext);
    if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');
  
    const { highlightedSquares, handleSquareClick, kingInCheckSquare } = boardContext;
    const theme = useContext(ThemeContext);

    const isKingInCheckHere = index === kingInCheckSquare;
    
  
    //const square = squares[index];
    const isHighlighted = highlightedSquares.includes(index);
  
    const isLightSquare = (Math.floor(index / 8) + (index % 8)) % 2 === 0;
    const lightSquareColor = theme?.theme === 'dark' ? '#555' : '#eee';
    const darkSquareColor = theme?.theme === 'dark' ? '#333' : '#666';
  
    /*
    const backgroundColor = isHighlighted
    ? 'yellow'
    : isLightSquare
    ? lightSquareColor
    : darkSquareColor;
  */
    let backgroundColor: string;
    const border = isHighlighted ? '2px solid black' : '1px solid transparent';

    if (isKingInCheckHere) {
      backgroundColor = 'lightgreen'; // King in check highlight
    } else if (isHighlighted) {
      backgroundColor = 'yellow';
    } else if (isLightSquare) {
      backgroundColor = lightSquareColor;
    } else {
      backgroundColor = darkSquareColor;
    }

    const styles: React.CSSProperties = {
      width: '100%',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backgroundColor: backgroundColor,
      border,
    };
    
    const kingPulse = isKingInCheckHere ? 'king-in-check' : '';

    
    return (
        <div style={styles} 
            className={kingPulse}
            onClick={() => handleSquareClick(index)}
        >
            {id && (
                <Piece
                    id={id}
                    name={name!}
                    color={color!}
                    location={index}
                    player={player!}
                    hasMoved={hasMoved}
                   
                />
            )}
        </div>
    );
  };

  export default Square;