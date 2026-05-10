import { chooseBestMove } from './search';
import type { AIWorkerRequest, AIWorkerResponse } from './workerTypes';

self.onmessage = (event: MessageEvent<AIWorkerRequest>) => {
  const { requestId, board, player, maxDepth, maxTimeMs, enPassantSquare } = event.data;

  const move = chooseBestMove(board, player, maxDepth, maxTimeMs, enPassantSquare);

  const response: AIWorkerResponse = {
    requestId,
    move,
  };

  self.postMessage(response);
};
