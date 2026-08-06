/**
 * @fileoverview Config Manager
 * Centralizes all configuration settings (such as REST API and WebSocket URLs)
 * based on the environment (development vs production).
 */

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8080';

export const APP_CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8081',
  WS_URL: WS_BASE,
  ON_DEVICE_API_URL: WS_BASE.replace(/^ws/, 'http'),
};
