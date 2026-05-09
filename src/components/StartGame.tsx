import React, { useContext } from 'react';
import { BoardContext } from '../context/board-context';
import { useNavigate } from 'react-router-dom';

const StartGame: React.FC = () => {
  const boardContext = useContext(BoardContext);
  const navigate = useNavigate();
  if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');

  const { setHumanPlayer, setGameMode, gameMode } = boardContext;

  // Hide once mode is chosen
  if (gameMode !== null) return null; // hide StartGame once a mode is chosen

  return (
    <div className="welcome-container" style={{ textAlign: 'center', marginTop: '20px' }}>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h1>Welcome to Chess!</h1>
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
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => navigate('/rules')}>How to Play / Rules</button>
        </div>
      </div>
    </div>
  );
};

export default StartGame;
