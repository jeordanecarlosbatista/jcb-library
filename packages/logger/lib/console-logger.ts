import { Logger, LoggerOptions } from "@/logger";

const mapper = {
  info: (logger: Console, message: string, logData?: unknown) =>
    logger.info(message, logData),
  error: (logger: Console, message: string, logData?: unknown) =>
    logger.error(message, logData),
  warn: (logger: Console, message: string, logData?: unknown) =>
    logger.warn(message, logData),
  debug: (logger: Console, message: string, logData?: unknown) =>
    logger.debug(message, logData),
  trace: (logger: Console, message: string, logData?: unknown) =>
    logger.trace(message, logData),
};

export class ConsoleLogger extends Logger {
  protected internalLog(data: LoggerOptions): void {
    const logger: Console = console;

    mapper[data.level](logger, data.message, data.logData);
  }
}
