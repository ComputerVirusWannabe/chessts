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
        <li>Checkmate: The king is in check and cannot escape. The game ends.</li>
        <li>Stalemate: The player to move has no legal moves and is not in check. The game is a draw.</li>
      </ul>
      <button onClick={() => navigate('/')}>Back to Start</button>
    </div>
  );
};

export default RulesPage;