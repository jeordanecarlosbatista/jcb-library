export interface Listener {
  handle(message: string | object): Promise<void>;
}
