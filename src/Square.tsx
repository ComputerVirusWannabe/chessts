import React, { useContext } from 'react';
import { BoardContext } from './context/BoardContext';
import Piece from './Piece';
import { ThemeContext } from './context/ThemeContext';
import { type PieceType } from './context/BoardContext';

type SquarePropsType = {
    index: number;
    onPieceClick?: (id: string, location: number, paths: number[]) => void;
  } & PieceType;
  

  const Square: React.FC<SquarePropsType> = ({ index, id, name, color, player, hasMoved, onPieceClick }) => {
    const boardContext = useContext(BoardContext);
    if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');
  
    const { highlightedSquares, handleSquareClick } = boardContext;
    const theme = useContext(ThemeContext);
  
    //const square = squares[index];
    const isHighlighted = highlightedSquares.includes(index);
  
    const isLightSquare = (Math.floor(index / 8) + (index % 8)) % 2 === 0;
    const lightSquareColor = theme?.theme === 'dark' ? '#555' : '#eee';
    const darkSquareColor = theme?.theme === 'dark' ? '#333' : '#666';
  
    const styles: React.CSSProperties = {
      width: '100%',
      height: '100%',
      minHeight: '0',
      backgroundColor: isLightSquare ? lightSquareColor : darkSquareColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: isHighlighted ? '3px solid yellow' : '1px solid black',
      cursor: 'pointer',
    };
  
    return (
        <div style={styles} onClick={() => handleSquareClick(index)}>
            {id && (
                <Piece
                    id={id}
                    name={name!}
                    color={color!}
                    location={index}
                    player={player!}
                    hasMoved={hasMoved}
                    onPieceClick={onPieceClick || (() => {})} // Default to an empty function
                />
            )}
        </div>
    );
  };

  export default Square;