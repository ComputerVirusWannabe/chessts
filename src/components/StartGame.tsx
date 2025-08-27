import React, { useContext } from 'react';
import { BoardContext } from '../context/BoardContext';

const StartGame: React.FC = () => {
  const boardContext = useContext(BoardContext);
  if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');

  const { setHumanPlayer, setGameMode, gameMode } = boardContext;

  // Hide once mode is chosen
  if (gameMode !== null) return null; // hide StartGame once a mode is chosen

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>Choose your side:</h2>
      <button
        onClick={() => {
          setHumanPlayer('player1');
          setGameMode('human-vs-ai');
        }}
        style={{ marginRight: '10px' }}
      >
        Play as Player 1 (White)
      </button>
      <button
        onClick={() => {
          setHumanPlayer('player2');
          setGameMode('human-vs-ai');
        }}
      >
        Play as Player 2 (Black)
      </button>

      <h4>Or play against a friend:</h4>
      <button
        onClick={() => {
          setGameMode('human-vs-human');
          setHumanPlayer(null); // no AI
        }}
      >
        Two Player
      </button>
    </div>
  );
};

export default StartGame;
