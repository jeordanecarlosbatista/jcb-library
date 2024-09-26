export interface Logger {
  setRequestId(id: string): void;
  getRequestId(): string;
  info(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
  trace(message: string, data?: unknown): void;
  time(message: string): void;
  timeEnd(message: string): void;
}
