import React, { useContext, useRef, useState } from 'react';
import Piece, { type PieceRefType } from './Piece';
import { ThemeContext } from './context/ThemeContext';
import { useBoardContext } from './context/BoardContext'; // <-- custom hook from your BoardContext
import './App.css';

// Types
type PieceLocation = {
  id: string;
  location: number;
};

type PiecePair = {
  source: PieceLocation | null;
  target: PieceLocation | null;
};

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

const boardGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gridTemplateRows: 'repeat(8, 1fr)',
  width: '90%',
  height: '90vw',
  maxWidth: '600px',
  maxHeight: '600px',
  margin: '20px auto',
  border: '2px solid black',
};

const Board: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext) as ThemeContextType;

  const { pieces, setPieces, playerTurn, setPlayerTurn } = useBoardContext();


  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [legalMoves, setLegalMoves] = useState<number[]>([]);
  const [pair, setPair] = useState<PiecePair>({ source: null, target: null });

  // refs to child pieces
  const arrayOfChildRefs = useRef<(PieceRefType | null)[]>([]);

  const getSquareColor = (index: number): string => {
    if (index === selectedId) return 'yellow';
    if (legalMoves.includes(index)) return 'lightgreen';

    const row = Math.floor(index / 8);
    const col = index % 8;
    const isLightSquare = (row + col) % 2 === 0;

    return theme === 'dark'
      ? isLightSquare ? '#769656' : '#EEEED2'
      : isLightSquare ? '#f0d9b5' : '#b58863';
  };

  const handlePieceClick = (clicked_id: string, clicked_location: number) => {
    const clickedPiece = { ...pieces[clicked_location], location: clicked_location };
    console.log('******************** Clicked piece:', clickedPiece);

    // First click — selecting a piece
    if (pair.source === null) {
      if (clickedPiece.name === 'Empty') return;
      if (clickedPiece.player !== playerTurn) return;

      setPair({ source: { id: clicked_id, location: clicked_location }, target: null });
      setSelectedId(clicked_location);

      const pieceRef = arrayOfChildRefs.current[clicked_location];
      const legal = pieceRef?.getLegitimatePaths?.() || [];
      setLegalMoves(legal);
    }
    // Second click — selecting target square
    else {
      setPair({ ...pair, target: { id: clicked_id, location: clicked_location } });

      const sourceLocation = pair.source.location;
      const pieceRef = arrayOfChildRefs.current[sourceLocation];
      const legitimatePaths = pieceRef?.getLegitimatePaths?.() || [];

      if (legitimatePaths.includes(clicked_location)) {
        const newPieces = [...pieces];
        newPieces[clicked_location] = {
          ...pieces[sourceLocation],
          hasMoved: true,
        };
        newPieces[sourceLocation] = {
          id: `${sourceLocation}`,
          name: 'Empty',
          color: 'green',
          player: null,
          hasMoved: false,
        };

        setPieces(newPieces);
        setPlayerTurn(playerTurn === 'player1' ? 'player2' : 'player1');
      }

      setPair({ source: null, target: null });
      setSelectedId(null);
      setLegalMoves([]);
    }
  };

  return (
    <>
      <div>
        DEBUG AREA
        <p>Pair: {JSON.stringify(pair)}</p>
        <h4>Current Turn: {playerTurn}</h4>
        <button onClick={toggleTheme}>
          Toggle Theme (current: {theme})
        </button>
      </div>

      <div>
        <h3>Chess Board</h3>
        <div style={boardGridStyle}>
          {pieces.map((piece, index) => (
            <div
              key={index}
              style={{
                backgroundColor: getSquareColor(index),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid black',
                boxSizing: 'border-box',
              }}
            >
              <Piece
                id={piece.id}
                name={piece.name}
                color={piece.color}
                location={index}
                player={piece.player}
                onPieceClick={handlePieceClick}
                //board={pieces}
                ref={(el) => (arrayOfChildRefs.current[index] = el)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Board;
