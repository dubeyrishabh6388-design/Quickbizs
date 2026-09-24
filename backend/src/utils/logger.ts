export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] : ${message}`;
  }

  info(message: string) {
    console.log(this.formatMessage(LogLevel.INFO, message));
  }

  warn(message: string) {
    console.warn(this.formatMessage(LogLevel.WARN, message));
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage(LogLevel.ERROR, message));
    if (error) {
      console.error(error);
    }
  }
}

export const logger = new Logger();
