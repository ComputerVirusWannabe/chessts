import type { BookEntry } from '../types/chess';

export const OPENING_BOOK: Record<string, BookEntry> = {
  '': {
    opening: 'Starting Position',
    moves: [
      { san: 'e4', weight: 50 },
      { san: 'd4', weight: 30 },
      { san: 'Nf3', weight: 10 },
      { san: 'c4', weight: 10 },
    ],
  },
  e4: {
    opening: "King's Pawn Game",
    moves: [
      { san: 'e5', weight: 35 },
      { san: 'c5', weight: 35 },
      { san: 'e6', weight: 12 },
      { san: 'c6', weight: 10 },
      { san: 'd5', weight: 8 },
    ],
  },
  'e4 e5': {
    opening: 'Open Game',
    moves: [
      { san: 'Nf3', weight: 20 },
      { san: 'Nc3', weight: 5 },
      { san: 'Bc4', weight: 5 },
    ],
  },
  'e4 e5 Nf3': {
    opening: "King's Knight Opening",
    moves: [
      { san: 'Nc6', weight: 70 },
      { san: 'Nf6', weight: 20 },
      { san: 'd6', weight: 10 },
    ],
  },
  'e4 e5 Nf3 Nc6': {
    opening: 'Ruy Lopez / Italian Game',
    moves: [
      { san: 'Bb5', weight: 55 },
      { san: 'Bc4', weight: 35 },
      { san: 'd4', weight: 10 },
    ],
  },
  'e4 e5 Nf3 Nc6 Bb5': {
    opening: 'Ruy Lopez',
    moves: [
      { san: 'a6', weight: 70 },
      { san: 'Nf6', weight: 30 },
    ],
  },
  'e4 e5 Nf3 Nc6 Bc4': {
    opening: 'Italian Game',
    moves: [
      { san: 'Bc5', weight: 65 },
      { san: 'Nf6', weight: 35 },
    ],
  },
  'e4 c5': {
    opening: 'Sicilian Defense',
    moves: [
      { san: 'Nf3', weight: 65 },
      { san: 'c3', weight: 15 },
      { san: 'd4', weight: 20 },
    ],
  },
  'e4 c5 Nf3': {
    opening: 'Sicilian Defense: Open',
    moves: [
      { san: 'd6', weight: 45 },
      { san: 'Nc6', weight: 35 },
      { san: 'e6', weight: 20 },
    ],
  },
  d4: {
    opening: "Queen's Pawn Opening",
    moves: [
      { san: 'd5', weight: 45 },
      { san: 'Nf6', weight: 35 },
      { san: 'e6', weight: 20 },
    ],
  },
  'd4 d5': {
    opening: "Queen's Pawn Game",
    moves: [
      { san: 'Bf4', weight: 40 },
      { san: 'c4', weight: 35 },
      { san: 'Nf3', weight: 25 },
    ],
  },
  'd4 d5 Bf4': {
    opening: 'London System',
    moves: [
      { san: 'Nf6', weight: 50 },
      { san: 'e6', weight: 30 },
      { san: 'c5', weight: 20 },
    ],
  },
  'd4 Nf6': {
    opening: 'Indian Defense',
    moves: [
      { san: 'c4', weight: 60 },
      { san: 'Nf3', weight: 25 },
      { san: 'Bf4', weight: 15 },
    ],
  },
  'e4 d5': {
    opening: 'Scandinavian Defense',
    moves: [
      { san: 'exd5', weight: 80 },
      { san: 'Nc3', weight: 20 },
    ],
  },
  'e4 d5 exd5': {
    opening: 'Scandinavian Defense',
    moves: [
      { san: 'Qxd5', weight: 70 },
      { san: 'Nf6', weight: 30 },
    ],
  },
};
