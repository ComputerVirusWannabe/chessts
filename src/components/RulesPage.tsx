import React from 'react';
import { useNavigate } from 'react-router-dom';

const RulesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h1>Chess Rules</h1>

      <ul>
        <li>Each player starts with 16 pieces: 8 pawns, 2 rooks, 2 knights, 2 bishops, 1 queen, and 1 king.</li>
        <li>White moves first, then players alternate turns.</li>
        <li>The goal is to checkmate your opponent's king.</li>
        <li>Pawns move forward one square, capture diagonally, and can move two squares on their first move.</li>
        <li>Rooks move any number of squares horizontally or vertically.</li>
        <li>Knights move in an "L" shape: two squares in one direction, then one square perpendicular.</li>
        <li>Bishops move any number of squares diagonally.</li>
        <li>The queen moves any number of squares in any direction.</li>
        <li>The king moves one square in any direction.</li>
        <li>Castling: Move the king two squares towards a rook, then move that rook to the square the king crossed.</li>
        <li>En passant: A special pawn capture under certain conditions.</li>
        <li>Pawns promote to any piece (except king) upon reaching the last rank.</li>
        <li>Check: The king is under threat. You must move out of check.</li>
        <li>Checkmate: The king is in check and cannot escape. The game ends. Once the game ends, undo/redo is disabled.</li>
        <li>Stalemate: The player to move has no legal moves and is not in check. The game is a draw.</li>
      </ul>

      <h2>PGN Import / Export</h2>

      <p>
        This app supports PGN (Portable Game Notation), a standard format used to store and share chess games.
        It allows you to save, reload, and replay full games.
      </p>

      <h3>Exporting a Game</h3>
      <ul>
        <li>Click “Export PGN” during or after a game.</li>
        <li>The full move history is converted into PGN format.</li>
        <li>The PGN text appears in the input box for copying.</li>
        <li>You can save it or share it with others.</li>
      </ul>

      <h3>Importing a Game</h3>
      <ul>
        <li>Paste a valid PGN string into the PGN box in the main game screen.</li>
        <li>Click “Import PGN”.</li>
        <li>The board will reconstruct the game move-by-move.</li>
        <li>You can then continue playing or review the game. NOTE: AI will not play import/exported games.</li>
      </ul>

      <h3>Undo / Redo Notes</h3>
      <ul>
        <li>Undo removes the last move played.</li>
        <li>In Human vs AI mode, undo removes both the player move and the AI response.</li>
        <li>Redo restores moves forward in history.</li>
        <li>Undo/Redo is disabled after checkmate or stalemate.</li>
      </ul>

      <button onClick={() => navigate('/')}>Back to Start</button>
    </div>
  );
};

export default RulesPage;