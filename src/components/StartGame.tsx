// StartGame.tsx
import React, { useContext } from 'react';
import { BoardContext } from '../context/BoardContext';

const StartGame: React.FC = () => {
  const boardContext = useContext(BoardContext);
  if (!boardContext) throw new Error('BoardContext must be used within a BoardProvider');

  const { humanPlayer, setHumanPlayer } = boardContext;

  if (humanPlayer) return null; // Already chosen, hide this component

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>Choose your side:</h2>
      <button onClick={() => setHumanPlayer('player1')} style={{ marginRight: '10px' }}>
        Play as Player 1 (White)
      </button>
      <button onClick={() => setHumanPlayer('player2')}>
        Play as Player 2 (Black)
      </button>
    </div>
  );
};

export default StartGame;
