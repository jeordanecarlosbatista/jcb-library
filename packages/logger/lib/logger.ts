import { v4 as uuid } from "uuid";

export interface ClientConfig {
  prettyPrint?: boolean;
  disabled?: boolean;
}

export type LevelType = "info" | "warn" | "debug" | "error" | "trace";

export interface LoggerOptions {
  message: string;
  logData?: any;
  level?: LevelType;
}

export abstract class Logger {
  private requestId: string = uuid();

  constructor(
    private readonly clientOptions: ClientConfig = {
      prettyPrint: false,
      disabled: false,
    }
  ) {}

  protected abstract internalLog(loggerData: LoggerOptions): void;

  log(data: LoggerOptions): void {
    if (this.clientOptions.disabled) return;
    this.internalLog(this.buildLog({ ...data, level: data.level || "info" }));
  }

  setRequestId(id: string): void {
    this.requestId = id;
  }

  getRequestId(): string {
    return this.requestId;
  }

  private buildLogData = (data: any) => {
    if (this.clientOptions.prettyPrint) return JSON.stringify(data, null, 2);
    return JSON.stringify(data);
  };

  private buildLog = (data: LoggerOptions) => {
    return {
      time: new Date().getTime(),
      loggingOrigin: process.env.LOGGING_ORIGIN,
      environment: process.env.NODE_ENV,
      requestId: this.requestId,
      message: data.message,
      level: data.level,
      logData: data.logData ? this.buildLogData(data.logData) : "",
    };
  };
}
