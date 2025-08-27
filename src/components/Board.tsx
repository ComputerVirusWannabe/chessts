import React, { useContext } from 'react';
import Square from './Square';
import StartGame from './StartGame';
import { BoardContext, type SquareType } from '../context/BoardContext';
import { ThemeContext } from '../context/ThemeContext';
import CapturedPieces from './CapturedPieces';
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

  // Separate captured pieces for each player
  const player1Captured = capturedPieces.filter(p => p.player === 'player1');
  const player2Captured = capturedPieces.filter(p => p.player === 'player2');

  // Determine orientation + index mapping
  let renderSquares = squares;
  let actualIndexFor = (i: number) => i;

  if (gameMode === 'human-vs-ai') {
    if (humanPlayer === 'player1') {
      renderSquares = squares;
      actualIndexFor = i => i;
    } else {
      renderSquares = [...squares].reverse();
      actualIndexFor = i => 63 - i;
    }
  } else {
    // human-vs-human: board is never flipped
    renderSquares = squares;
    actualIndexFor = i => i;
  }

  // Captured rows
  let topCaptured, bottomCaptured;

  if (gameMode === 'human-vs-human') {
    topCaptured = player2Captured;   // black pieces on top
    bottomCaptured = player1Captured; // white pieces bottom
  } else {
    if (humanPlayer === 'player1') {
      topCaptured = player2Captured;
      bottomCaptured = player1Captured;
    } else {
      topCaptured = player1Captured;
      bottomCaptured = player2Captured;
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{ marginBottom: '10px' }}>
        Toggle Theme
      </button>

      <button
        onClick={() => {
          boardContext.setGameMode(null);          // hide the board, show StartGame
          boardContext.setHumanPlayer(null);       // reset human player
          boardContext.setCapturedPieces([]);      // clear captured pieces
          boardContext.setSquares(boardContext.squares.map(sq => ({ piece: null }))); // reset board

          // Recreate initial setup if you want pieces back
          const initialSquares: SquareType[] = Array.from({ length: 64 }, () => ({ piece: null }));
          // …populate initialSquares with pieces exactly like in BoardProvider
          boardContext.setSquares(initialSquares);
        }}
      >
        Back to Start
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

      {/* Captured pieces (top) */}
      <CapturedPieces capturedPieces={topCaptured} />

      {/* Chess board */}
      <div className="board" style={{ margin: '10px auto' }}>
        {renderSquares.map((sq, index) => {
          const actualIndex = actualIndexFor(index);
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

      {/* Captured pieces (bottom) */}
      <CapturedPieces capturedPieces={bottomCaptured} />
    </div>
  );
};

export default Board;
