/**
 * @fileoverview Modul Core: Logging System
 * Menyediakan utilitas logging tersentralisasi dengan log levels,
 * konsol berwarna, dan penyimpanan buffer sementara di memori untuk memudahkan debugging.
 */

export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

const levelNames: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
};

const levelValues = new Set<number>([0, 1, 2, 3]);

export interface LogMessage {
    timestamp: string;
    level: LogLevel;
    levelName: string;
    context: string;
    message: string;
    extra?: any;
}

class LoggerService {
    private currentLevel: LogLevel = LogLevel.INFO;
    private logBuffer: LogMessage[] = [];
    private maxBufferSize = 150;

    constructor() {
        const savedLevel = localStorage.getItem('app_log_level');
        if (savedLevel) {
            const levelVal = parseInt(savedLevel, 10);
            if (levelValues.has(levelVal)) {
                this.currentLevel = levelVal as LogLevel;
            }
        } else if (import.meta.env.DEV) {
            this.currentLevel = LogLevel.DEBUG;
        }
    }

    public setLogLevel(level: LogLevel): void {
        this.currentLevel = level;
        localStorage.setItem('app_log_level', level.toString());
    }

    public getLogLevel(): LogLevel {
        return this.currentLevel;
    }

    public getLogs(): LogMessage[] {
        return [...this.logBuffer];
    }

    public clearLogs(): void {
        this.logBuffer = [];
    }

    public downloadLogs(): void {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(this.logBuffer, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `ecgrhythmia_logs_${new Date().toISOString()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    private log(level: LogLevel, context: string, message: string, extra?: any): void {
        if (level < this.currentLevel) return;

        const timestamp = new Date().toISOString();
        const levelName = levelNames[level] || 'UNKNOWN';
        const logEntry: LogMessage = { timestamp, level, levelName, context, message, extra };

        // Tambah ke ring buffer
        this.logBuffer.push(logEntry);
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift();
        }

        // Tampilkan ke konsol
        if (import.meta.env.PROD && level < LogLevel.WARN) {
            return;
        }

        const styles = this.getConsoleStyle(level);
        const consoleMsg = `[${timestamp}] [${levelName}] [${context}] ${message}`;
        
        if (extra !== undefined) {
            console.groupCollapsed(`%c${consoleMsg}`, styles);
            console.log('Extra Details:', extra);
            console.groupEnd();
        } else {
            console.log(`%c${consoleMsg}`, styles);
        }
    }

    private getConsoleStyle(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG:
                return 'color: #888888; font-weight: normal;';
            case LogLevel.INFO:
                return 'color: #176bce; font-weight: 500;';
            case LogLevel.WARN:
                return 'color: #f59e0b; font-weight: bold;';
            case LogLevel.ERROR:
                return 'color: #ef4444; font-weight: bold; background-color: #fee2e2; padding: 2px 4px; border-radius: 4px;';
            default:
                return '';
        }
    }

    public debug(context: string, message: string, extra?: any): void {
        this.log(LogLevel.DEBUG, context, message, extra);
    }

    public info(context: string, message: string, extra?: any): void {
        this.log(LogLevel.INFO, context, message, extra);
    }

    public warn(context: string, message: string, extra?: any): void {
        this.log(LogLevel.WARN, context, message, extra);
    }

    public error(context: string, message: string, extra?: any): void {
        this.log(LogLevel.ERROR, context, message, extra);
    }
}

export const Logger = new LoggerService();
