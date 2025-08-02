// Custom middleware logger for URL shortener
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];

  private log(level: LogEntry['level'], message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    this.logs.push(entry);
    
    // Also output to console for development
    if (level === 'error') {
      console.error(`[${entry.timestamp}] ${message}`, data);
    } else if (level === 'warn') {
      console.warn(`[${entry.timestamp}] ${message}`, data);
    } else {
      console.info(`[${entry.timestamp}] ${message}`, data);
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();