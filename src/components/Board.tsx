import React, { useContext } from 'react';
import Square from './Square';
import StartGame from './StartGame';
import { BoardContext } from '../context/BoardContext';
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

  const bottomPlayer: 'player1' | 'player2' = gameMode === 'human-vs-ai' && humanPlayer === 'player2'
    ? 'player2'
    : 'player1';
  const topPlayer: 'player1' | 'player2' = bottomPlayer === 'player1' ? 'player2' : 'player1';

  const topCaptured = capturedPieces.filter(p => p.capturedBy === topPlayer);
  const bottomCaptured = capturedPieces.filter(p => p.capturedBy === bottomPlayer);

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{ marginBottom: '10px' }}>
        Toggle Theme
      </button>

      <button
        onClick={() => {
          boardContext.setSquares(boardContext.createInitialSquares());
          boardContext.setCapturedPieces([]);
          boardContext.setHumanPlayer(null);
          boardContext.setGameMode(null);
          boardContext.setCurrentTurn('player1');
          boardContext.setLastMove(null);
          boardContext.setEnPassantSquare(null);
          boardContext.setPromotionPawn(null);
          boardContext.setHighlightedSquares([]);
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

      <div className="board-area">
        <div className="captured-row">
          <CapturedPieces capturedPieces={topCaptured} />
        </div>
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
        <div className="captured-row">
        <CapturedPieces capturedPieces={bottomCaptured} />
        </div>
      </div>
    </div>
  );
};

export default Board;
