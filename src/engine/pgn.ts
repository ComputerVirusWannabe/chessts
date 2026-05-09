import { applyLegalMove, buildSan, getLegalMoves } from './game';
import { cloneGameSnapshot, createInitialGameSnapshot } from './boardState';
import type { GameSnapshot, LegalMove } from '../types/chess';

const RESULT_TOKENS = new Set(['1-0', '0-1', '1/2-1/2', '*']);

const stripHeadersAndAnnotations = (pgn: string) =>
  pgn
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\{[^}]*}/g, ' ')
    .replace(/;[^\n\r]*/g, ' ')
    .replace(/\$\d+/g, ' ')
    .replace(/\([^()]*\)/g, ' ')
    .replace(/\d+\.(\.\.)?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeSan = (san: string) =>
  san
    .replace(/0-0-0/g, 'O-O-O')
    .replace(/0-0/g, 'O-O')
    .replace(/[!?]+/g, '')
    .replace(/\s+/g, '')
    .trim();

const findMoveBySan = (snapshot: GameSnapshot, token: string): LegalMove => {
  const legalMoves = getLegalMoves(snapshot.squares, snapshot.currentTurn, snapshot.enPassantSquare).map(move => ({
    ...move,
    san: buildSan(snapshot.squares, move, snapshot.enPassantSquare),
  }));
  const normalizedToken = normalizeSan(token);
  const matchedMove = legalMoves.find(move => normalizeSan(move.san ?? '') === normalizedToken);

  if (!matchedMove) {
    throw new Error(`Unable to match PGN move "${token}" at move ${snapshot.moveHistory.length + 1}.`);
  }

  return matchedMove;
};

export const exportPgn = (snapshot: GameSnapshot): string => {
  const headers = [
    '[Event "chessts Casual Game"]',
    '[Site "ComputerVirusWannabe/chessts"]',
    `[Date "${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}"]`,
    '[Round "-"]',
    '[White "Player 1"]',
    '[Black "Player 2"]',
    '[Result "*"]',
  ];

  const moveText: string[] = [];
  for (let index = 0; index < snapshot.moveHistory.length; index += 2) {
    const whiteMove = snapshot.moveHistory[index];
    const blackMove = snapshot.moveHistory[index + 1];
    moveText.push(`${Math.floor(index / 2) + 1}. ${whiteMove.san}${blackMove ? ` ${blackMove.san}` : ''}`);
  }

  const body = moveText.length ? `${moveText.join(' ')} *` : '*';
  return `${headers.join('\n')}\n\n${body}`;
};

export const importPgn = (pgn: string): GameSnapshot[] => {
  const cleanedPgn = stripHeadersAndAnnotations(pgn);
  const tokens = cleanedPgn
    .split(' ')
    .map(token => token.trim())
    .filter(token => token.length > 0 && !RESULT_TOKENS.has(token));

  let currentSnapshot = createInitialGameSnapshot();
  const snapshots: GameSnapshot[] = [cloneGameSnapshot(currentSnapshot)];

  for (const token of tokens) {
    const matchedMove = findMoveBySan(currentSnapshot, token);
    const { snapshot } = applyLegalMove(currentSnapshot, matchedMove);
    currentSnapshot = snapshot;
    snapshots.push(cloneGameSnapshot(snapshot));
  }

  return snapshots;
};
