import React, { useContext } from 'react';
import Square from './Square';
import StartGame from './StartGame';
import { BoardContext } from '../context/BoardContext';
import { ThemeContext } from '../context/ThemeContext';
import CapturedPieces, { type CapturedPiece } from './CapturedPieces';
import '../styles/Board.css';

const Board: React.FC = () => {
  const boardContext = useContext(BoardContext);
  if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');

  const { humanPlayer, squares, capturedPieces, currentTurn, gameMode } = boardContext;
  const themeContext = useContext(ThemeContext);

  // Show StartGame if player hasn't chosen a side yet
  if (!gameMode) return <StartGame />;

  const toggleTheme = () => {
    if (themeContext) {
      themeContext.setTheme(themeContext.theme === 'dark' ? 'light' : 'dark');
    }
  };

  // Separate captured pieces for top/bottom
  const player1Captured: CapturedPiece[] = capturedPieces.filter(p => p.player === 'player1'); // pieces lost by player1
  const player2Captured: CapturedPiece[] = capturedPieces.filter(p => p.player === 'player2'); // pieces lost by player2

  // Flip board if human is player2
  //const renderSquares = humanPlayer === 'player1' ? squares : [...squares].reverse();
  const renderSquares =
  gameMode === 'human-vs-ai'
    ? humanPlayer === 'player1'
      ? squares
      : [...squares].reverse()
    : squares;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{ marginBottom: '10px' }}>
        Toggle Theme
      </button>

      {/* Current turn display */}
      <div
        className={`px-4 py-1 rounded-xl font-semibold shadow-md ${
          currentTurn === 'player1' ? 'bg-gray-300 text-black' : 'bg-red-400 text-white'
        }`}
        style={{ marginBottom: '10px' }}
      >
        {currentTurn === 'player1' ? "Player 1's Turn" : "Player 2's Turn"}
      </div>

      {/* Captured pieces for player 2 (top of board) */}
      <CapturedPieces capturedPieces={humanPlayer === 'player1' ? player2Captured : player1Captured} />

      {/* Chess board */}
      <div className="board" style={{ margin: '10px auto' }}>
        {renderSquares.map((sq, index) => {
          // Correct square index for flipping
          //const actualIndex = humanPlayer === 'player1' ? index : 63 - index;
          const actualIndex =
          gameMode === 'human-vs-ai'
            ? (humanPlayer === 'player1' ? index : 63 - index)
            : index;


          return (
            <Square
              key={actualIndex}
              index={actualIndex}
              location={actualIndex}
              id={sq.piece?.id || ''}
              name={sq.piece?.name || ''}
              color={sq.piece?.color || ''}
              player={sq.piece?.player || null}
              hasMoved={sq.piece?.hasMoved || false}
            />
          );
        })}
      </div>

      {/* Captured pieces for player 1 (bottom of board) */}
      <CapturedPieces capturedPieces={humanPlayer === 'player1' ? player1Captured : player2Captured} />
    </div>
  );
};

export default Board;
