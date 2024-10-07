import { SQSClient } from "@aws-sdk/client-sqs";
import { SQSProvider } from "@lib/sqs-provider";
import { SQSListener } from "@lib/manager/queue-listener";
import { QueueListener } from "@lib/queue-listener";

interface ListenerManager {
  addListener(queueUrl: string, listener: SQSListener): void;
  start(): void;
  stop(): void;
}

type QueueListenerManagedArguments = {
  queues: { queueName: string; listener: QueueListener }[];
};

class QueueListenerManaged implements ListenerManager {
  sqsProvider: SQSProvider;
  private listeners: Map<string, SQSListener> = new Map();

  constructor(args: QueueListenerManagedArguments) {
    const sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_SQS_ENDPOINT,
    });
    this.sqsProvider = new SQSProvider(sqsClient);

    args.queues.forEach(({ queueName, listener }) => {
      this.addListener(
        `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`,
        new SQSListener(this.sqsProvider, queueName, listener)
      );
    });
  }

  public addListener(queueUrl: string, listener: SQSListener): void {
    this.listeners.set(queueUrl, listener);
  }

  public start(): void {
    this.listeners.forEach((listener) => listener.start());
  }

  public stop(): void {
    this.listeners.forEach((listener) => listener.stop());
  }
}

export { QueueListenerManaged, ListenerManager as ISQSListenerManager };
