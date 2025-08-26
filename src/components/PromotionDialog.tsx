import React, { useContext } from 'react';
import { BoardContext } from '../context/BoardContext';

type PromotionDialogProps = {
  onSelect: (pieceName: 'queen' | 'rook' | 'bishop' | 'knight') => void;
};

const PromotionDialog: React.FC<PromotionDialogProps> = ({ onSelect }) => {
  const boardContext = useContext(BoardContext);
  if (!boardContext) throw new Error('BoardContext must be used within BoardProvider');

  const { promotionPawn } = boardContext;

  if (!promotionPawn) return null; // don't render if no promotion pending

  const options: ('queen' | 'rook' | 'bishop' | 'knight')[] = ['queen', 'rook', 'bishop', 'knight'];

  return (
    <div className="promotion-overlay">
      <div className="promotion-box">
        {options.map(piece => (
          <button
            key={piece}
            onClick={() => onSelect(piece)}
            style={{ margin: '5px', padding: '10px' }}
          >
            {piece.charAt(0).toUpperCase() + piece.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromotionDialog;
