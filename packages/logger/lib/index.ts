export interface Logger {
  setRequestId(id: string): void;
  getRequestId(): string;
  info(message: string, data?: any): void;
  error(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  debug(message: string, data?: any): void;
  trace(message: string, data?: any): void;
  time(message: string): void;
  timeEnd(message: string): void;
}
