import type { BookEntry } from '../types/chess';

export const OPENING_BOOK: Record<string, BookEntry> = {
  START_POSITION_HASH: {
    opening: "Initial Position",
    moves: [
      { san: 'e4', weight: 50 },
      { san: 'd4', weight: 30 },
      { san: 'Nf3', weight: 20 },
    ],
  },
};

