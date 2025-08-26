export class StockfishEngine {
    engine: Worker;
    private listeners: ((msg: string) => void)[] = [];
  
    constructor() {
      // Use the public folder copy
      this.engine = new Worker("/stockfish-17.1-lite-single-03e3232.js");
      this.engine.onmessage = (event: any) => {
        const line = typeof event === "string" ? event : event.data;
        this.listeners.forEach((fn) => fn(line));
      };
  
      // Handshake
      this.sendCommand("uci");
    }
  
    async init(): Promise<void> {
      return new Promise((resolve) => {
        const unsubscribe = this.onMessage((msg) => {
          if (msg === "uciok") {
            this.sendCommand("isready");
          }
          if (msg === "readyok") {
            resolve();
            unsubscribe();
          }
        });
      });
    }
  
    onMessage(handler: (msg: string) => void) {
      this.listeners.push(handler);
      return () => {
        this.listeners = this.listeners.filter((h) => h !== handler);
      };
    }
  
    sendCommand(cmd: string) {
      this.engine.postMessage(cmd);
    }
  
    setPosition(fen: string) {
      this.sendCommand(`position fen ${fen}`);
    }
    // high depth can cause out-of-bounds memory allocation *********************
    async getBestMove(fen: string, movetime = 1000): Promise<string> {
      return new Promise((resolve) => {
        const unsubscribe = this.onMessage((msg) => {
          if (msg.startsWith("bestmove")) {
            const [, best] = msg.split(" ");
            unsubscribe();
            clearTimeout(timeoutId);
            resolve(best);
          }
        });
        this.setPosition(fen);
        this.sendCommand(`go movetime ${movetime}`);
        //alternatively can use this.sendCommand(`go depth ${15}`); for fixed depth calculation
        // Force stop if it takes too long
        const timeoutId = setTimeout(() => {
          this.sendCommand("stop");
        }, movetime + 50); // small buffer after movetime
      });
    }
  
    terminate() {
      this.engine.terminate();
    }
  }
  