import type { ServerMessage } from '../../core/types/ecgTypes';
import { verifyChecksum } from '../security/checksum';
import { apiJson } from '../../config/api';
import { WS_URL } from '../../config/env';
export class ECGWebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private stopped = true;
  private generation = 0;
  private orderedMessages: Promise<void> = Promise.resolve();
  public onMessage?: (message: ServerMessage) => void;
  public onError?: (error: Event | string) => void;
  public onClose?: () => void;
  public onOpen?: () => void;
  private endpoint: string;
  private sessionId: string;
  constructor(endpoint: string = WS_URL, sessionId = '') {
    this.endpoint = endpoint;
    this.sessionId = sessionId;
  }
  connect(): void {
    if (
      !this.sessionId ||
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    )
      return;
    this.stopped = false;
    const generation = ++this.generation;
    void apiJson<{ ticket: string }>('/api/stream/ticket', {
      method: 'POST',
      body: JSON.stringify({ session_id: this.sessionId }),
    })
      .then(({ ticket }) => {
        if (this.stopped || generation !== this.generation) return;
        const url = new URL(this.endpoint, WS_URL);
        url.pathname = '/ws';
        url.search = '';
        url.searchParams.set('ticket', ticket);
        const socket = new WebSocket(url);
        this.socket = socket;
        socket.onopen = () => {
          this.attempts = 0;
          this.onOpen?.();
        };
        let pendingMessages = 0;
        socket.onmessage = (event) => {
          if (
            pendingMessages >= 64 ||
            String(event.data).length > 2 * 1024 * 1024
          ) {
            this.onError?.(
              'Klien tertinggal; menyambungkan ulang untuk memulihkan rekaman',
            );
            this.generation++;
            socket.close(1013, 'Recover from history');
            return;
          }
          pendingMessages++;
          this.orderedMessages = this.orderedMessages
            .then(async () => {
              if (this.stopped || generation !== this.generation) return;
              const envelope = JSON.parse(String(event.data));
              if (
                envelope.type !== 'ecg_packet' ||
                !(await verifyChecksum(
                  envelope.content,
                  envelope.sha256_checksum,
                ))
              )
                throw new Error('Integritas paket tidak valid');
              const message = JSON.parse(envelope.content) as ServerMessage;
              if (message.session_id !== this.sessionId)
                throw new Error('Paket sesi tidak sesuai');
              if (!this.stopped && generation === this.generation)
                this.onMessage?.(message);
            })
            .catch((problem) => {
              if (!this.stopped && generation === this.generation)
                this.onError?.(
                  problem instanceof Error ? problem.message : 'Paket ditolak',
                );
            })
            .finally(() => {
              pendingMessages--;
            });
        };
        socket.onerror = (event) => {
          if (!this.stopped && generation === this.generation)
            this.onError?.(event);
        };
        socket.onclose = () => {
          if (this.socket === socket) this.socket = null;
          this.onClose?.();
          this.scheduleReconnect();
        };
      })
      .catch((problem) => {
        if (this.stopped || generation !== this.generation) return;
        if (problem.status === 401 || problem.status === 403)
          this.stopped = true;
        this.onError?.(problem.message || 'Koneksi ditolak');
        this.scheduleReconnect();
      });
  }
  private scheduleReconnect() {
    if (this.stopped || this.reconnectTimer) return;
    const delay =
      Math.min(30000, 1000 * 2 ** Math.min(this.attempts++, 5)) +
      Math.random() * 250;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
  sendCommand(command: object) {
    if (this.isConnected()) this.socket?.send(JSON.stringify(command));
  }
  disconnect() {
    this.stopped = true;
    this.generation++;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    const socket = this.socket;
    this.socket = null;
    if (socket) {
      socket.onclose = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onopen = null;
      socket.close();
    }
  }
}
