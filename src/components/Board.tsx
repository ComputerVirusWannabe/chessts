import React, { useContext } from 'react';
import Square from './Square';
import { BoardContext } from '../context/BoardContext';
import { ThemeContext } from '../context/ThemeContext';
import CapturedPieces, { type CapturedPiece } from './CapturedPieces';
import '../styles/Board.css';

const Board: React.FC = () => {
  const boardContext = useContext(BoardContext);
  if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');

  const { squares, capturedPieces, currentTurn } = boardContext;
  const themeContext = useContext(ThemeContext);

  const toggleTheme = () => {
    if (themeContext) {
      themeContext.setTheme(themeContext.theme === 'dark' ? 'light' : 'dark');
    }
  };

  // Filter captured pieces correctly
  const player1Captured: CapturedPiece[] = capturedPieces.filter(p => p.player === 'player1'); // pieces lost by player1
  const player2Captured: CapturedPiece[] = capturedPieces.filter(p => p.player === 'player2'); // pieces lost by player2

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={toggleTheme} style={{ marginBottom: '10px' }}>
        Toggle Theme
      </button>

      <div
        className={`px-4 py-1 rounded-xl font-semibold shadow-md ${
          currentTurn === 'player1' ? 'bg-gray-300 text-black' : 'bg-red-400 text-white'
        }`}
        style={{ marginBottom: '10px' }}
      >
        {currentTurn === 'player1' ? "Player 1's Turn" : "Player 2's Turn"}
      </div>

      {/* Player 2 captured pieces on top */}
      <CapturedPieces capturedPieces={player2Captured} />

      <div className="board" style={{ margin: '10px auto' }}>
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
          />
        ))}
      </div>

      {/* Player 1 captured pieces at bottom */}
      <CapturedPieces capturedPieces={player1Captured} />
    </div>
  );
};

export default Board;
