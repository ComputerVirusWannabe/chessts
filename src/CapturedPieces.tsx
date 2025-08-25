import React from 'react';

export type CapturedPiece = {
  id: string;
  name: string;
  color: string;
  player: 'player1' | 'player2' | null;
};

type CapturedPiecesProps = {
  capturedPieces: CapturedPiece[];
};

// Optional: map names to symbols
const pieceSymbols: Record<string, string> = {
  pawn: 'P',
  rook: 'R',
  knight: 'N',
  bishop: 'B',
  queen: 'Q',
  king: 'K',
};

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ capturedPieces }) => {
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      {capturedPieces.map(piece => (
        <div
          key={piece.id}
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: piece.color,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '4px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px',
          }}
        >
          {pieceSymbols[piece.name] || piece.name[0].toUpperCase()}
        </div>
      ))}
    </div>
  );
};

export default CapturedPieces;
