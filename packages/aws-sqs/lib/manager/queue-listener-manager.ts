import { SQSClient } from "@aws-sdk/client-sqs";
import { SQSProvider } from "@lib/sqs-provider";
import { SQSListener } from "@lib/manager/queue-listener";
import { QueueListener } from "@lib/queue-listener";

export interface ListenerManager {
  start(): void;
  stop(): void;
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
    const sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_SQS_ENDPOINT,
    });
    this.sqsProvider = new SQSProvider(sqsClient);
    this.queues = args.queues;

    this.addAllListener();
  }

  public getAllQueueUrls(): string[] {
    return this.queues.map(
      ({ queueName }) => `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`
    );
  }

  public start(): void {
    this.listeners.forEach((listener) => listener.start());
  }

  public stop(): void {
    this.listeners.forEach((listener) => listener.stop());
  }

  private addListener(queueUrl: string, listener: SQSListener): void {
    this.listeners.set(queueUrl, listener);
  }

  private addAllListener() {
    this.queues.forEach(({ queueName, listener }) => {
      this.addListener(
        `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`,
        new SQSListener({
          sqsProvider: this.sqsProvider,
          queueName,
          listenerInstance: listener,
          pollingInterval: this.args.pollingInterval,
          receiveMaxNumberOfMessages: this.args.receiveMaxNumberOfMessages,
          waitTimeSeconds: this.args.waitTimeSeconds,
        })
      );
    });
  }
}

export { QueueListenerManaged, ListenerManager as ISQSListenerManager };
