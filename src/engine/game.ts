import { generatePseudoLegalMoves } from './moveGenerators';
import {
  calculateCastlingMoves,
  indexToSquareName,
  isCheckmate,
  isSquareAttacked,
  isStalemate,
  opponent,
  squaresToFEN,
  filterLegalMoves,
} from './logic';
import { cloneSquares } from './boardState';
import type {
  GameSnapshot,
  LegalMove,
  MoveHistoryEntry,
  PieceName,
  Player,
  PromotionPieceName,
  SquareType,
} from '../types/chess';

const SAN_PIECE_LETTER: Record<PieceName, string> = {
  pawn: '',
  knight: 'N',
  bishop: 'B',
  rook: 'R',
  queen: 'Q',
  king: 'K',
};

const PROMOTION_SAN_LETTER: Record<PromotionPieceName, string> = {
  queen: 'Q',
  rook: 'R',
  bishop: 'B',
  knight: 'N',
};

const PROMOTION_PIECES: PromotionPieceName[] = ['queen', 'rook', 'bishop', 'knight'];

const isPromotionMove = (piece: LegalMove['piece'], to: number): boolean =>
  piece.name === 'pawn' &&
  ((piece.player === 'player1' && to >= 0 && to <= 7) ||
    (piece.player === 'player2' && to >= 56 && to <= 63));

const getCapturedPiece = (
  squares: SquareType[],
  move: Pick<LegalMove, 'to' | 'piece' | 'isEnPassant'>
) => {
  if (move.isEnPassant) {
    const capturedIndex = move.piece.player === 'player1' ? move.to + 8 : move.to - 8;
    return squares[capturedIndex]?.piece ?? undefined;
  }

  return squares[move.to]?.piece ?? undefined;
};

const executeMove = (
  squares: SquareType[],
  move: LegalMove
) => {
  const nextSquares = cloneSquares(squares);
  const movingPiece = nextSquares[move.from].piece;

  if (!movingPiece) {
    throw new Error(`No piece found on square ${move.from}.`);
  }

  const capturedPiece = getCapturedPiece(nextSquares, move);

  nextSquares[move.from].piece = null;

  if (move.isEnPassant) {
    const capturedIndex = move.piece.player === 'player1' ? move.to + 8 : move.to - 8;
    nextSquares[capturedIndex].piece = null;
  }

  nextSquares[move.to].piece = {
    ...movingPiece,
    location: move.to,
    hasMoved: true,
    name: move.promotion ?? movingPiece.name,
  };

  if (move.isCastling) {
    const row = Math.floor(move.from / 8);
    if (move.to > move.from) {
      const rookFrom = row * 8 + 7;
      const rookTo = row * 8 + 5;
      const rook = nextSquares[rookFrom].piece;
      if (rook) {
        nextSquares[rookTo].piece = { ...rook, location: rookTo, hasMoved: true };
        nextSquares[rookFrom].piece = null;
      }
    } else {
      const rookFrom = row * 8;
      const rookTo = row * 8 + 3;
      const rook = nextSquares[rookFrom].piece;
      if (rook) {
        nextSquares[rookTo].piece = { ...rook, location: rookTo, hasMoved: true };
        nextSquares[rookFrom].piece = null;
      }
    }
  }

  const nextEnPassantSquare =
    move.piece.name === 'pawn' && Math.abs(move.to - move.from) === 16
      ? (move.from + move.to) / 2
      : null;

  return {
    nextSquares,
    capturedPiece,
    nextEnPassantSquare,
  };
};

const fileForIndex = (index: number) => String.fromCharCode(97 + (index % 8));
const rankForIndex = (index: number) => String(8 - Math.floor(index / 8));

const getDisambiguation = (move: LegalMove, legalMoves: LegalMove[]) => {
  const ambiguousMoves = legalMoves.filter(
    candidate =>
      candidate !== move &&
      candidate.piece.name === move.piece.name &&
      candidate.to === move.to &&
      candidate.from !== move.from
  );

  if (!ambiguousMoves.length) {
    return '';
  }

  const sameFile = ambiguousMoves.some(candidate => fileForIndex(candidate.from) === fileForIndex(move.from));
  const sameRank = ambiguousMoves.some(candidate => rankForIndex(candidate.from) === rankForIndex(move.from));

  if (!sameFile) {
    return fileForIndex(move.from);
  }

  if (!sameRank) {
    return rankForIndex(move.from);
  }

  return `${fileForIndex(move.from)}${rankForIndex(move.from)}`;
};

export const getLegalMoves = (
  squares: SquareType[],
  player: Player,
  enPassantSquare: number | null = null
): LegalMove[] => {
  const legalMoves: LegalMove[] = [];

  for (let index = 0; index < 64; index++) {
    const piece = squares[index].piece;
    if (!piece || piece.player !== player) {
      continue;
    }

    const pseudoMoves = generatePseudoLegalMoves(piece, index, squares, enPassantSquare ?? undefined);
    if (piece.name === 'king' && !piece.hasMoved) {
      pseudoMoves.push(...calculateCastlingMoves(piece, squares));
    }

    const filteredMoves = filterLegalMoves(piece, index, pseudoMoves, squares, enPassantSquare ?? undefined);

    for (const to of filteredMoves) {
      const isEnPassant =
        piece.name === 'pawn' && enPassantSquare !== null && to === enPassantSquare && !squares[to].piece;
      const baseMove = {
        from: index,
        to,
        piece,
        captured: getCapturedPiece(squares, { to, piece, isEnPassant }),
        isEnPassant,
        isCastling: piece.name === 'king' && Math.abs(to - index) === 2,
      };

      if (isPromotionMove(piece, to)) {
        for (const promotion of PROMOTION_PIECES) {
          legalMoves.push({ ...baseMove, promotion });
        }
        continue;
      }

      legalMoves.push(baseMove);
    }
  }

  return legalMoves;
};

export const buildSan = (
  squares: SquareType[],
  move: LegalMove,
  enPassantSquare: number | null = null,
  legalMoves = getLegalMoves(squares, move.piece.player as Player, enPassantSquare)
): string => {
  let san = '';

  if (move.isCastling) {
    san = move.to > move.from ? 'O-O' : 'O-O-O';
  } else {
    const pieceLetter = SAN_PIECE_LETTER[move.piece.name];
    const destination = indexToSquareName(move.to);
    const captureMarker = move.captured ? 'x' : '';

    if (move.piece.name === 'pawn') {
      const filePrefix = move.captured ? fileForIndex(move.from) : '';
      san = `${filePrefix}${captureMarker}${destination}`;
    } else {
      san = `${pieceLetter}${getDisambiguation(move, legalMoves)}${captureMarker}${destination}`;
    }

    if (move.promotion) {
      san += `=${PROMOTION_SAN_LETTER[move.promotion]}`;
    }
  }

  const { nextSquares, nextEnPassantSquare } = executeMove(squares, move);
  const nextPlayer = opponent(move.piece.player as Player);

  if (isCheckmate(nextPlayer, nextSquares, nextEnPassantSquare ?? undefined)) {
    return `${san}#`;
  }

  const opponentKingSquare = nextSquares.findIndex(
    square => square.piece?.player === nextPlayer && square.piece.name === 'king'
  );

  if (opponentKingSquare >= 0 && isSquareAttacked(opponentKingSquare, move.piece.player as Player, nextSquares)) {
    return `${san}+`;
  }

  return san;
};

const buildMoveHistoryEntry = (
  snapshot: GameSnapshot,
  move: LegalMove,
  san: string,
  nextSnapshot: GameSnapshot
): MoveHistoryEntry => {
  const completedMoveCount = snapshot.moveHistory.length + 1;
  return {
    moveNumber: Math.ceil(completedMoveCount / 2),
    player: snapshot.currentTurn,
    piece: move.piece.name,
    from: move.from,
    to: move.to,
    san,
    capturedPiece: move.captured?.name,
    promotion: move.promotion,
    fen: squaresToFEN(
      nextSnapshot.squares,
      nextSnapshot.currentTurn,
      nextSnapshot.lastMove ?? undefined,
      0,
      Math.floor(completedMoveCount / 2) + 1
    ),
  };
};

export const applyLegalMove = (
  snapshot: GameSnapshot,
  move: LegalMove,
  legalMoves = getLegalMoves(snapshot.squares, snapshot.currentTurn, snapshot.enPassantSquare)
) => {
  const san = buildSan(snapshot.squares, move, snapshot.enPassantSquare, legalMoves);
  const { nextSquares, capturedPiece, nextEnPassantSquare } = executeMove(snapshot.squares, move);
  const nextTurn = opponent(snapshot.currentTurn);
  const kingSquare = nextSquares.findIndex(
    square => square.piece?.player === nextTurn && square.piece.name === 'king'
  );
  const kingInCheckSquare =
    kingSquare >= 0 && isSquareAttacked(kingSquare, snapshot.currentTurn, nextSquares) ? kingSquare : null;

  const nextSnapshot: GameSnapshot = {
    squares: nextSquares,
    capturedPieces: capturedPiece
      ? [...snapshot.capturedPieces, { ...capturedPiece, capturedBy: snapshot.currentTurn }]
      : [...snapshot.capturedPieces],
    currentTurn: nextTurn,
    enPassantSquare: nextEnPassantSquare,
    lastMove: {
      from: move.from,
      to: move.to,
      piece: {
        ...move.piece,
        location: move.to,
        hasMoved: true,
        name: move.promotion ?? move.piece.name,
      },
      captured: capturedPiece ? { ...capturedPiece } : undefined,
      promotion: move.promotion,
      isEnPassant: move.isEnPassant,
      isCastling: move.isCastling,
      san,
    },
    kingInCheckSquare,
    moveHistory: [...snapshot.moveHistory],
  };

  const historyEntry = buildMoveHistoryEntry(snapshot, move, san, nextSnapshot);
  nextSnapshot.moveHistory.push(historyEntry);

  return {
    snapshot: nextSnapshot,
    san,
    isCheckmate: isCheckmate(nextTurn, nextSquares, nextEnPassantSquare ?? undefined),
    isStalemate: isStalemate(nextTurn, nextSquares, nextEnPassantSquare ?? undefined),
  };
};
