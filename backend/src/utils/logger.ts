export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
}

class Logger {
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;
  private errorCount: number = 0;
  private warnCount: number = 0;
  private infoCount: number = 0;

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] : ${message}`;
  }

  private pushToBuffer(level: LogLevel, message: string, details?: any) {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      details: details ? (typeof details === "object" ? (details.stack || details.message || JSON.stringify(details)) : String(details)) : undefined,
    };

    if (level === LogLevel.ERROR) this.errorCount++;
    else if (level === LogLevel.WARN) this.warnCount++;
    else this.infoCount++;

    this.logBuffer.unshift(entry); // newest first
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.pop();
    }
  }

  info(message: string, details?: any) {
    console.log(this.formatMessage(LogLevel.INFO, message));
    this.pushToBuffer(LogLevel.INFO, message, details);
  }

  warn(message: string, details?: any) {
    console.warn(this.formatMessage(LogLevel.WARN, message));
    this.pushToBuffer(LogLevel.WARN, message, details);
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage(LogLevel.ERROR, message));
    if (error) {
      console.error(error);
    }
    this.pushToBuffer(LogLevel.ERROR, message, error);
  }

  getLogs(options?: { level?: string; search?: string; limit?: number }): LogEntry[] {
    let logs = [...this.logBuffer];

    if (options?.level && options.level !== "ALL") {
      const targetLevel = options.level.toUpperCase();
      logs = logs.filter((l) => l.level === targetLevel);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.message.toLowerCase().includes(q) ||
          (l.details && String(l.details).toLowerCase().includes(q))
      );
    }

    const limit = options?.limit || 200;
    return logs.slice(0, limit);
  }

  clearLogs(): void {
    this.logBuffer = [];
    this.errorCount = 0;
    this.warnCount = 0;
    this.infoCount = 0;
    this.info("System logs buffer was cleared by Administrator.");
  }

  getStats() {
    return {
      total: this.logBuffer.length,
      errors: this.errorCount,
      warnings: this.warnCount,
      infos: this.infoCount,
      bufferCapacity: this.maxBufferSize,
      lastLogTime: this.logBuffer[0]?.timestamp || null,
    };
  }
}

export const logger = new Logger();
