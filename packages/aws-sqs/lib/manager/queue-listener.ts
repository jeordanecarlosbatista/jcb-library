import { SQSProvider } from "../sqs-provider";
import { QueueListener } from "../queue-listener";

interface Listener {
  start(): void;
  stop(): void;
}

interface QueueListenerParams {
  sqsProvider: SQSProvider;
  queueName: string;
  listenerInstance: QueueListener;
  pollingInterval: number;
  receiveMaxNumberOfMessages: number;
  waitTimeSeconds: number;
}

class SQSListener implements Listener {
  private isListening: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly pollingInterval: number;
  private readonly queueName: string;
  private readonly listenerInstance: QueueListener;
  private readonly sqsProvider: SQSProvider;
  private readonly maxNumberOfMessages: number;
  private readonly waitTimeSeconds: number;

  constructor(args: QueueListenerParams) {
    this.sqsProvider = args.sqsProvider;
    this.queueName = args.queueName;
    this.listenerInstance = args.listenerInstance;
    this.pollingInterval = args.pollingInterval;
    this.maxNumberOfMessages = args.receiveMaxNumberOfMessages;
    this.waitTimeSeconds = args.waitTimeSeconds;
  }

  private get queueUrl() {
    return `${process.env.SQS_QUEUE_BASE_URL}/${this.queueName}`;
  }

  public start() {
    // istanbul ignore next
    if (this.isListening) return;
    this.isListening = true;
    console.log(`Listener started for queue: ${this.queueUrl}`);
    this.pollMessages();
  }

  public stop() {
    // istanbul ignore next
    if (!this.isListening) return;
    this.isListening = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async pollMessages() {
    this.intervalId = setInterval(async () => {
      // istanbul ignore next
      if (!this.isListening) return;

      const messages = await this.sqsProvider.receiveMessage({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: this.maxNumberOfMessages,
        WaitTimeSeconds: this.waitTimeSeconds,
      });

      if (messages.Messages) {
        for (const message of messages.Messages) {
          try {
            await this.listenerInstance.handleMessage(message);
            await this.sqsProvider.deleteMessage({
              QueueUrl: this.queueUrl,
              ReceiptHandle: message.ReceiptHandle!,
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
    }, this.pollingInterval);
  }
}

export { SQSListener, Listener };
