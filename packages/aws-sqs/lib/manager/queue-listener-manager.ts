import { SQSProvider } from "@lib/sqs-provider";
import { SQSListener } from "@lib/manager/queue-listener";
import { QueueListener } from "@lib/queue-listener";

interface ListenerManager {
  start(): void;
  stop(): void;
  addListener(queueName: string, listener: QueueListener): void;
  getAllQueueUrls(): string[];
}

type QueueListenerManagedArguments = {
  queueName: string;
  listener: QueueListener;
};
type ListenerManagedArguments = {
  pollingInterval: number;
  receiveMaxNumberOfMessages: number;
  waitTimeSeconds: number;
  queues: QueueListenerManagedArguments[];
};

class QueueListenerManaged implements ListenerManager {
  private readonly queues: QueueListenerManagedArguments[];
  private readonly sqsProvider: SQSProvider;
  private readonly listeners: Map<string, SQSListener> = new Map();

  constructor(private readonly args: ListenerManagedArguments) {
    this.sqsProvider = SQSProvider.factory();
    this.queues = args.queues;

    this.addAllListener();
  }

  public getAllQueueUrls(): string[] {
    return Array.from(this.listeners.keys());
  }

  public getListeners(): SQSListener[] {
    return Array.from(this.listeners.values());
  }

  public start(): void {
    this.listeners.forEach((listener) => listener.start());
  }

  public stop(): void {
    this.getListeners().forEach((listener) => listener.stop());
  }

  addListener(queueName: string, listener: QueueListener): void {
    this.listeners.set(
      `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`,
      this.buildListener(queueName, listener)
    );
  }

  private buildListener(
    queueName: string,
    listener: QueueListener
  ): SQSListener {
    return new SQSListener({
      sqsProvider: this.sqsProvider,
      queueName,
      listenerInstance: listener,
      pollingInterval: this.args.pollingInterval,
      receiveMaxNumberOfMessages: this.args.receiveMaxNumberOfMessages,
      waitTimeSeconds: this.args.waitTimeSeconds,
    });
  }

  private addAllListener() {
    this.queues.forEach(({ queueName, listener }) => {
      this.listeners.set(
        `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`,
        this.buildListener(queueName, listener)
      );
    });
  }
}

export { QueueListenerManaged, ListenerManager };
