import { LoggerService, LogLevel } from '@nestjs/common';

export class AppLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.print('LOG', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.print('ERROR', message, context, trace);
  }

  warn(message: any, context?: string) {
    this.print('WARN', message, context);
  }

  debug(message: any, context?: string) {
    this.print('DEBUG', message, context);
  }

  verbose(message: any, context?: string) {
    this.print('VERBOSE', message, context);
  }

  private print(
    level: string,
    message: any,
    context?: string,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const ctx = context || this.context || 'Application';

    const color = {
      LOG: '\x1b[32m',     // green
      ERROR: '\x1b[31m',   // red
      WARN: '\x1b[33m',    // yellow
      DEBUG: '\x1b[36m',   // cyan
      VERBOSE: '\x1b[35m', // magenta
    }[level] || '\x1b[0m';

    const reset = '\x1b[0m';

    console.log(
      `${color}[${timestamp}] [${level}] [${ctx}]${reset} ${message}`,
    );

    if (trace) {
      console.log(`${color}${trace}${reset}`);
    }
  }
}