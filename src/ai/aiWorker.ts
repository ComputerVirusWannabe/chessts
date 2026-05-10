import type { Move } from './engine';
import type { AIWorkerRequest, AIWorkerResponse } from './workerTypes';

export const aiWorker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

let nextRequestId = 0;
const pendingRequests = new Map<
  number,
  {
    resolve: (move: Move | null) => void;
    reject: (error: Error) => void;
  }
>();

aiWorker.addEventListener('message', (event: MessageEvent<AIWorkerResponse>) => {
  const pending = pendingRequests.get(event.data.requestId);
  if (!pending) {
    return;
  }

  pendingRequests.delete(event.data.requestId);
  pending.resolve(event.data.move);
});

aiWorker.addEventListener('error', event => {
  const error = new Error(event.message || 'AI worker failed.');
  for (const pending of pendingRequests.values()) {
    pending.reject(error);
  }
  pendingRequests.clear();
});

export function requestAiMove(request: Omit<AIWorkerRequest, 'requestId'>): Promise<Move | null> {
  nextRequestId = (nextRequestId + 1) % Number.MAX_SAFE_INTEGER;
  if (nextRequestId === 0) {
    nextRequestId = 1;
  }
  const requestId = nextRequestId;

  return new Promise((resolve, reject) => {
    pendingRequests.set(requestId, { resolve, reject });
    aiWorker.postMessage({ ...request, requestId });
  });
}

export function terminateAiWorker() {
  for (const pending of pendingRequests.values()) {
    pending.reject(new Error('AI worker terminated.'));
  }
  pendingRequests.clear();
  aiWorker.terminate();
}
