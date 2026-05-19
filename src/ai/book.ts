import { OPENING_BOOK } from './openingBook';
import { findMoveBySan } from '../engine/pgn';
import type { GameSnapshot, LegalMove } from '../types/chess';

const normalizeSan = (san: string): string =>
  san
    .replace(/0-0-0/g, 'O-O-O')
    .replace(/0-0/g, 'O-O')
    .replace(/[+#]+/g, '')
    .replace(/\s+/g, '')
    .trim();

const getHistoryKey = (snapshot: GameSnapshot): string =>
  snapshot.moveHistory.map(entry => normalizeSan(entry.san)).join(' ');

const selectWeightedMove = (
  candidates: Array<{ move: LegalMove; opening: string; weight: number }>
): { move: LegalMove; opening: string } | null => {
  if (candidates.length === 0) {
    return null;
  }

  const totalWeight = candidates.reduce((sum, candidate) => sum + Math.max(0, candidate.weight), 0);
  if (totalWeight <= 0) {
    return null;
  }

  let target = Math.random() * totalWeight;

  for (const candidate of candidates) {
    target -= Math.max(0, candidate.weight);
    if (target <= 0) {
      return { move: candidate.move, opening: candidate.opening };
    }
  }

  const fallback = candidates[candidates.length - 1];
  return { move: fallback.move, opening: fallback.opening };
};

export function detectOpening(snapshot: GameSnapshot): string | null {
  const normalizedMoves = snapshot.moveHistory.map(entry => normalizeSan(entry.san));

  let bestMatch: string | null = null;
  let bestLength = -1;

  for (const [key, entry] of Object.entries(OPENING_BOOK)) {
    if (!entry.opening) {
      continue;
    }

    const line = key.length > 0 ? key.split(' ').map(normalizeSan) : [];
    if (line.length > normalizedMoves.length) {
      continue;
    }

    const isPrefix = line.every((move, index) => move === normalizedMoves[index]);
    if (isPrefix && line.length > bestLength) {
      bestLength = line.length;
      bestMatch = entry.opening;
    }
  }

  return bestMatch;
}

export function getBookMove(snapshot: GameSnapshot): { move: LegalMove; opening: string } | null {
  const key = getHistoryKey(snapshot);
  const bookEntry = OPENING_BOOK[key];

  if (!bookEntry) {
    return null;
  }

  const weightedCandidates = bookEntry.moves
    .map(option => {
      try {
        const move = findMoveBySan(snapshot, option.san);
        return {
          move,
          opening: bookEntry.opening ?? detectOpening(snapshot) ?? 'Book Line',
          weight: option.weight,
        };
      } catch {
        return null;
      }
    })
    .filter((candidate): candidate is { move: LegalMove; opening: string; weight: number } => candidate !== null);

  return selectWeightedMove(weightedCandidates);
}
