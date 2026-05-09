import React from 'react';
import { pieceSymbolsBlack } from './Piece';
import { pieceSymbolsWhite } from './Piece';

export type CapturedPiece = {
  id: string;
  name: string;
  color: string;
  player: 'player1' | 'player2' | null;
};

type CapturedPiecesProps = {
  capturedPieces: CapturedPiece[];
};

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ capturedPieces }) => {
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      {capturedPieces.map(piece => {
        // Determine which symbol set to use
        let symbol = piece.name[0].toUpperCase();
        if (piece.player === 'player1') {
          symbol = pieceSymbolsBlack[piece.name] || symbol;
        } else if (piece.player === 'player2') {
          symbol = pieceSymbolsWhite[piece.name] || symbol;
        }
        return (
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
              color: 'GreenYellow',
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            {symbol}
          </div>
        );
      })}
    </div>
  );
};

export default CapturedPieces;