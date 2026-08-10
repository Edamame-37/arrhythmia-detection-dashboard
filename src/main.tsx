import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'
import { Logger } from './core/utils/logger'

// Global Uncaught Exceptions Logger
window.addEventListener('error', (event) => {
  Logger.error('GlobalError', event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack || event.error
  });
});

// Global Unhandled Promise Rejections Logger
window.addEventListener('unhandledrejection', (event) => {
  Logger.error('UnhandledPromise', String(event.reason), {
    reason: event.reason?.stack || event.reason
  });
});

Logger.info('System', 'Aplikasi ecgrhythmia berhasil dimulai.');

// Menghubungkan aplikasi React ke elemen <div id="root"> di index.html
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)