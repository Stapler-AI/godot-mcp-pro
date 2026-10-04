import { EventEmitter } from 'node:events';
import { WebSocketServer, WebSocket } from 'ws';
import { log } from './log.js';

/** Error raised for a JSON-RPC error object returned by the Godot addon. */
export class GodotError extends Error {
  constructor(public code: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'GodotError';
  }
}

interface Pending {
  id: number;
  method: string;
  params: Record<string, unknown>;
  timeoutMs: number;
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
  timer?: NodeJS.Timeout;
}

export interface BridgeOptions {
  /** Ports to try, in order. The addon polls 6505-6514. */
  ports: number[];
  /** Returns the shared token when the editor asks for one. */
  tokenProvider?: () => string | null;
  /** Godot's WebSocketPeer buffers are 16 MB each way. */
  maxPayload?: number;
  /** Interval for our keep-alive ping; the status panel flags "idle" after 2 s. */
  pingIntervalMs?: number;
}

/**
 * Listens for the Godot editor addon (which is the WebSocket *client*) and
 * exposes a promise-based, strictly serialized `call()` API.
 */
export class GodotBridge extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private socket: WebSocket | null = null;
  private ready = false;
  private nextId = 1;
  private queue: Pending[] = [];
  private inflight: Pending | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private readyTimer: NodeJS.Timeout | null = null;
  public port: number | null = null;

  constructor(private opts: BridgeOptions) {
    super();
  }

  /** Bind the first free port from `opts.ports`. Resolves with the port. */
  async listen(): Promise<number> {
    for (const port of this.opts.ports) {
      try {
        await this.tryListen(port);
        this.port = port;
        log(`listening on ws://127.0.0.1:${port} (waiting for the Godot editor)`);
        return port;
      } catch (e) {
        const err = e as NodeJS.ErrnoException;
        if (err.code !== 'EADDRINUSE') throw err;
      }
    }
    throw new Error(`No free port in ${this.opts.ports[0]}-${this.opts.ports.at(-1)}`);
  }

  private tryListen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const wss = new WebSocketServer({
        host: '127.0.0.1',
        port,
        maxPayload: this.opts.maxPayload ?? 16 * 1024 * 1024,
      });
      wss.once('listening', () => {
        wss.removeListener('error', reject);
        wss.on('error', (e) => log('server error:', e.message));
        wss.on('connection', (ws) => this.onConnection(ws));
        this.wss = wss;
        resolve();
      });
      wss.once('error', (e) => {
        wss.close();
        reject(e);
      });
    });
  }

  isConnected(): boolean {
    return this.ready && this.socket?.readyState === WebSocket.OPEN;
  }

  /** Wait until the editor is attached (or the deadline passes). */
  waitForConnection(ms: number): Promise<boolean> {
    if (this.isConnected()) return Promise.resolve(true);
    return new Promise((resolve) => {
      const done = (ok: boolean) => {
        clearTimeout(t);
        this.off('ready', onReady);
        resolve(ok);
      };
      const onReady = () => done(true);
      const t = setTimeout(() => done(false), ms);
      this.once('ready', onReady);
    });
  }

  /** Send one JSON-RPC request. Calls are serialized: one in flight at a time. */
  call(method: string, params: Record<string, unknown> = {}, timeoutMs = 30_000): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id: this.nextId++, method, params, timeoutMs, resolve, reject });
      this.pump();
    });
  }

  get queueLength(): number {
    return this.queue.length + (this.inflight ? 1 : 0);
  }

  async close(): Promise<void> {
    this.stopPing();
    this.failAll(new Error('Bridge closed'));
    this.socket?.close(1000, 'Server shutting down');
    this.socket = null;
    await new Promise<void>((r) => (this.wss ? this.wss.close(() => r()) : r()));
  }

  // ---- internals -------------------------------------------------------

  private onConnection(ws: WebSocket): void {
    if (this.socket && this.socket !== ws) {
      log('a second Godot editor connected; replacing the previous peer');
      this.socket.removeAllListeners();
      this.socket.close(1000, 'Replaced by a newer editor connection');
      this.failAll(new Error('Godot editor connection replaced'));
    }
    this.socket = ws;
    this.ready = false;
    log('Godot editor connected');

    ws.on('message', (data) => this.onMessage(data.toString()));
    ws.on('close', (code, reason) => {
      if (this.socket !== ws) return;
      log(`Godot editor disconnected (${code} ${reason.toString()})`);
      this.socket = null;
      this.ready = false;
      this.stopPing();
      this.failAll(new Error('Godot editor disconnected'));
      this.emit('disconnected');
    });
    ws.on('error', (e) => log('socket error:', e.message));

    // The addon sends `auth_required` in the same frame it sees the socket
    // open; give it a moment before treating the peer as ready.
    if (this.readyTimer) clearTimeout(this.readyTimer);
    this.readyTimer = setTimeout(() => {
      if (this.socket === ws && !this.ready) this.markReady();
    }, 150);
    this.startPing();
  }

  private markReady(): void {
    this.ready = true;
    this.emit('ready');
    this.pump();
  }

  private send(obj: unknown): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify(obj));
    return true;
  }

  private onMessage(text: string): void {
    let msg: any;
    try {
      msg = JSON.parse(text);
    } catch {
      log('non-JSON frame from Godot ignored');
      return;
    }
    if (typeof msg !== 'object' || msg === null) return;

    if (msg.method === 'ping') {
      if (msg.id === undefined || msg.id === null) this.send({ jsonrpc: '2.0', method: 'pong', params: {} });
      else this.send({ jsonrpc: '2.0', id: msg.id, result: { pong: true } });
      return;
    }
    if (msg.method === 'pong') return;

    if (msg.method === 'auth_required') {
      if (this.readyTimer) clearTimeout(this.readyTimer);
      this.ready = false;
      const token = this.opts.tokenProvider?.() ?? null;
      if (!token) {
        log('editor requires a connection token but user://mcp_auth_token could not be read; ' +
          'set GODOT_PROJECT_PATH so the server can find it, or disable godot_mcp_pro/require_connection_token');
        return;
      }
      const id = this.nextId++;
      this.authId = id;
      this.send({ jsonrpc: '2.0', id, method: 'auth', params: { token } });
      return;
    }

    if ('id' in msg && (msg.result !== undefined || msg.error !== undefined)) {
      if (msg.id === this.authId) {
        this.authId = null;
        if (msg.error) log('authentication rejected:', msg.error.message);
        else { log('authenticated with editor'); this.markReady(); }
        return;
      }
      const p = this.inflight;
      if (!p || p.id !== msg.id) {
        log(`late or unknown response for id ${msg.id} ignored`);
        return;
      }
      this.inflight = null;
      if (p.timer) clearTimeout(p.timer);
      if (msg.error) {
        const e = msg.error;
        p.reject(new GodotError(e.code ?? -32000, e.message ?? 'Unknown error', e.data));
      } else {
        p.resolve(msg.result);
      }
      this.pump();
      return;
    }

    log('unhandled frame from Godot:', text.slice(0, 200));
  }

  private authId: number | null = null;

  private pump(): void {
    if (this.inflight || !this.isConnected()) return;
    const p = this.queue.shift();
    if (!p) return;
    this.inflight = p;
    if (!this.send({ jsonrpc: '2.0', id: p.id, method: p.method, params: p.params })) {
      this.inflight = null;
      p.reject(new Error('Godot editor not connected'));
      return;
    }
    p.timer = setTimeout(() => {
      if (this.inflight === p) {
        this.inflight = null;
        p.reject(new Error(`Timed out after ${p.timeoutMs} ms waiting for Godot to answer '${p.method}'`));
        this.pump();
      }
    }, p.timeoutMs);
  }

  private failAll(err: Error): void {
    const all = [...(this.inflight ? [this.inflight] : []), ...this.queue];
    this.inflight = null;
    this.queue = [];
    for (const p of all) {
      if (p.timer) clearTimeout(p.timer);
      p.reject(err);
    }
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.send({ jsonrpc: '2.0', method: 'ping', params: {} });
    }, this.opts.pingIntervalMs ?? 2000);
  }

  private stopPing(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }
}
