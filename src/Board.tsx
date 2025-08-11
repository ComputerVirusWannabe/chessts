import React, { useContext, useRef, useState } from 'react';
import Piece, {type PieceRefType} from './Piece';
import { ThemeContext } from './context/ThemeContext';
import { v4 as uuidv4 } from 'uuid';
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

type ChessPiece = {
  id: string;
  name: string;
  color: string;
  hasMoved?: boolean;
};

const boardGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gridTemplateRows: 'repeat(8, 1fr)',
  width: '1500px',
  height: '1500px',
  border: '2px solid black',
  gap: '1px',
};

const Board: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext) as ThemeContextType;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [legalMoves, setLegalMoves] = useState<number[]>([]);
  const [playerTurn, setPlayerTurn] = useState<'red' | 'grey'>('red');
  const [pair, setPair] = useState<PiecePair>({ source: null, target: null });

  const arrayOfChildRefs = useRef<(PieceRefType | null)[]>([]);

  const [pieces, setPieces] = useState<ChessPiece[]>([
    // Row 1 (Red pieces)
    { id: uuidv4(), name: 'Rook', color: 'red' },
    { id: uuidv4(), name: 'Knight', color: 'red' },
    { id: uuidv4(), name: 'Bishop', color: 'red' },
    { id: uuidv4(), name: 'Queen', color: 'red' },
    { id: uuidv4(), name: 'King', color: 'red' },
    { id: uuidv4(), name: 'Bishop', color: 'red' },
    { id: uuidv4(), name: 'Knight', color: 'red' },
    { id: uuidv4(), name: 'Rook', color: 'red' },
    { id: uuidv4(), name: 'Pawn', color: 'red' },
    { id: uuidv4(), name: 'Pawn', color: 'red' },
    { id: uuidv4(), name: 'Pawn', color: 'red' },
    { id: uuidv4(), name: 'Pawn', color: 'red' },
    { id: uuidv4(), name: 'Pawn', color: 'red' },
    { id: uuidv4(), name: 'Pawn', color: 'red' },
    { id: uuidv4(), name: 'Pawn', color: 'red' },
    { id: uuidv4(), name: 'Pawn', color: 'red' },

    // Empty middle rows
    ...Array(32).fill(null).map(() => ({
      id: uuidv4(),
      name: 'Empty',
      color: 'green',
    })),

    // Row 7 (Grey pawns)
    { id: uuidv4(), name: 'Pawn', color: 'grey' },
    { id: uuidv4(), name: 'Pawn', color: 'grey' },
    { id: uuidv4(), name: 'Pawn', color: 'grey' },
    { id: uuidv4(), name: 'Pawn', color: 'grey' },
    { id: uuidv4(), name: 'Pawn', color: 'grey' },
    { id: uuidv4(), name: 'Pawn', color: 'grey' },
    { id: uuidv4(), name: 'Pawn', color: 'grey' },
    { id: uuidv4(), name: 'Pawn', color: 'grey' },
    { id: uuidv4(), name: 'Rook', color: 'grey' },
    { id: uuidv4(), name: 'Knight', color: 'grey' },
    { id: uuidv4(), name: 'Bishop', color: 'grey' },
    { id: uuidv4(), name: 'Queen', color: 'grey' },
    { id: uuidv4(), name: 'King', color: 'grey' },
    { id: uuidv4(), name: 'Bishop', color: 'grey' },
    { id: uuidv4(), name: 'Knight', color: 'grey' },
    { id: uuidv4(), name: 'Rook', color: 'grey' },
  ]);

  const getSquareColor = (index: number): string => {
    if (index === selectedId) return 'yellow';
    if (legalMoves.includes(index)) return 'lightgreen';

    const row = Math.floor(index / 8);
    const col = index % 8;
    const isLightSquare = (row + col) % 2 === 0;

    return theme === 'dark'
      ? (isLightSquare ? '#769656' : '#EEEED2')
      : (isLightSquare ? '#f0d9b5' : '#b58863');
  };

  const getPieces = () => ({
    pieces,
    selectedId: selectedId ?? undefined,
  });

  const handlePieceClick = (clicked_id: string, clicked_location: number) => {
    const clickedPiece = { ...pieces[clicked_location], location: clicked_location };

    // First click — selecting a piece
    if (pair.source === null) {
      if (clickedPiece.name === 'Empty') return;
      if (clickedPiece.color !== playerTurn) return;

      setPair({ source: { id: clicked_id, location: clicked_location }, target: null });
      setSelectedId(clicked_location);

      // Instead of getLegalMoves from moveGenerator.ts, use the Piece's own method
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
        newPieces[clicked_location] = pieces[sourceLocation];
        newPieces[sourceLocation] = {
          id: `${sourceLocation}`,
          name: 'Empty',
          color: 'green',
          hasMoved: false,
        };
        setPieces(newPieces);
        setPlayerTurn(playerTurn === 'red' ? 'grey' : 'red');
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
              }}
            >
              <Piece
                id={piece.id}
                name={piece.name}
                color={piece.color}
                location={index}
                onPieceClick={handlePieceClick}
                getAllPiecesFromBoard={getPieces}
                ref={(el) => (arrayOfChildRefs.current[index] = el)}
              />
            </div>
          ))}
        </div>
        <button onClick={toggleTheme}>
          Toggle Theme (current: {theme})
        </button>
      </div>
    </>
  );
};

export default Board;
