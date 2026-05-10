import type { Move } from './engine';
import type { AIWorkerRequest, AIWorkerResponse } from './workerTypes';

export const aiWorker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

let nextRequestId = 0;

export function requestAiMove(request: Omit<AIWorkerRequest, 'requestId'>): Promise<Move | null> {
  const requestId = ++nextRequestId;

  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent<AIWorkerResponse>) => {
      if (event.data.requestId !== requestId) {
        return;
      }

      cleanup();
      resolve(event.data.move);
    };

    const handleError = (event: ErrorEvent) => {
      cleanup();
      reject(new Error(event.message || 'AI worker failed.'));
    };

    const cleanup = () => {
      aiWorker.removeEventListener('message', handleMessage);
      aiWorker.removeEventListener('error', handleError);
    };

    aiWorker.addEventListener('message', handleMessage);
    aiWorker.addEventListener('error', handleError);
    aiWorker.postMessage({ ...request, requestId });
  });
}
