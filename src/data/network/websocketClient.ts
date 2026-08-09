/**
 * @fileoverview Modul Data Layer: WebSocket Client
 * Hanya mengurus urusan konektivitas jaringan TCP/IP.
 * Memanggil modul checksum eksternal untuk keamanan.
 */

import type { ServerMessage } from '../../core/types/ecgTypes';
import { verifyChecksum } from '../security/checksum';
import { WS_URL } from '../../config/env';

export const getWebSocketHost = (): string => {
    return window.location.hostname === '10.0.2.2' ? '10.0.2.2' : '127.0.0.1';
};

export class ECGWebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;

    public onMessage?: (data: ServerMessage) => void;
    public onError?: (error: Event | string) => void;
    public onClose?: () => void;
    public onOpen?: () => void;

    constructor(endpoint: string) {
        if (endpoint.startsWith('ws://') || endpoint.startsWith('wss://')) {
            this.url = endpoint;
        } else {
            const baseUrl = WS_URL;
            this.url = `${baseUrl.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        }
    }

    public connect(): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        console.log(`[Network] Mencoba terhubung ke: ${this.url}`);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("[Network] Terhubung ke Server Rust!");
            if (this.onOpen) this.onOpen();
        };

        this.ws.onmessage = async (event: MessageEvent) => {
            try {
                const data: ServerMessage = JSON.parse(event.data);

                if (data.type === 'live_data' || data.type === 'segment_data') {
                    if (data.data_payload && data.sha256_checksum) {
                        const isValid = await verifyChecksum(data.data_payload, data.sha256_checksum);
                        if (!isValid) {
                            console.error("[Network] Integritas data terkompromi. Paket diabaikan.");
                            return;
                        }
                    }
                }

                if (this.onMessage) this.onMessage(data);
            } catch (err) {
                console.error("[Network] Gagal memparsing pesan:", err);
            }
        };

        this.ws.onerror = (event: Event) => {
            console.error("[Network] Kesalahan WebSocket!");
            if (this.onError) this.onError(event);
        };

        this.ws.onclose = () => {
            console.log("[Network] Koneksi ditutup.");
            if (this.onClose) this.onClose();
            this.ws = null;
        };
    }

    public sendCommand(command: object): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(command));
        } else {
            console.warn("[Network] WebSocket belum siap dikirim perintah.");
        }
    }

    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}