import { chooseBestMove } from './search';

self.onmessage = (event) => {
  const { board, player, maxDepth, maxTimeMs } = event.data;

  const move = chooseBestMove(board, player, maxDepth, maxTimeMs);

  self.postMessage(move);
};

export const aiWorker = new Worker(
    new URL('../engine/aiWorker.ts', import.meta.url),
    { type: 'module' }
  );

