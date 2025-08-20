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
  const { currentTurn } = useContext(BoardContext)!;


  const toggleTheme = () => {
    if (themeContext) {
      themeContext.setTheme(themeContext.theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <div>
      <button onClick={toggleTheme} style={{ marginBottom: '10px' }}>
        Toggle Theme
      </button>
      <div
        className={`px-4 py-1 rounded-xl font-semibold shadow-md ${
          currentTurn === 'player1' ? 'bg-gray-300 text-black' : 'bg-red-400 text-white'
        }`}
      >
        {currentTurn === 'player1' ? "Player 1's Turn" : "Player 2's Turn"}
      </div>
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
