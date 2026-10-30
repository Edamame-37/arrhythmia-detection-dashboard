export const API_URL = import.meta.env.VITE_API_URL ?? '';
const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  socketProtocol + '//' + window.location.host + '/ws';
export const SUPPORT_CONTACT = import.meta.env.VITE_SUPPORT_CONTACT || '/faq';
