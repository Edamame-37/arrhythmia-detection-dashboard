/**
 * Sentralisasi konfigurasi Environment Variables
 * Single source of truth untuk konfigurasi aplikasi
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8081';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8080';
