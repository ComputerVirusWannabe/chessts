import React, { useContext } from 'react';
import Square from './Square';
import { BoardContext } from './context/BoardContext';
import { ThemeContext } from './context/ThemeContext';
import './Board.css';

const Board: React.FC = () => {
  const boardContext = useContext(BoardContext);
  if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');

  const { squares } = boardContext;

  const themeContext = useContext(ThemeContext);

  const toggleTheme = () => {
    if (themeContext) {
      themeContext.setTheme(themeContext.theme === 'dark' ? 'light' : 'dark');
    }
  };
  /*
  const boardStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gridTemplateRows: 'repeat(8, 1fr)',
    width: '90%',
    height: '90vw',
    maxWidth: '600px',
    maxHeight: '600px',
    margin: '20px auto',
    border: '2px solid black',
  };
  */

  return (
    <div>
      <button onClick={toggleTheme} style={{ marginBottom: '10px' }}>
        Toggle Theme
      </button>

      <div className="board">
        {squares.map((_, index) => (
          <Square
            key={index}
            index={index}
            location={index}  
            id={squares[index].piece?.id || ''}
            name={squares[index].piece?.name || ''}
            color={squares[index].piece?.color || ''}
            player={squares[index].piece?.player || null}
            hasMoved={squares[index].piece?.hasMoved || false}
            onPieceClick={boardContext.handlePieceClick}
          />
        
        ))}
      </div>
    </div>
  );
};

export default Board;
