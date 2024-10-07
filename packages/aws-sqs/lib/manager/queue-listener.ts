import { EventEmitter } from "events";
import { SQSProvider } from "../sqs-provider";
import { QueueListener } from "../queue-listener";

interface Listener {
  start(): void;
  stop(): void;
}

class SQSListener extends EventEmitter implements Listener {
  private isListening: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly sqsProvider: SQSProvider,
    private readonly queueName: string,
    private readonly listenerInstance: QueueListener,
    private readonly pollingInterval: number = 1000
  ) {
    super();
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

      try {
        const messages = await this.sqsProvider.receiveMessage({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 20,
        });

        if (messages.Messages) {
          for (const message of messages.Messages) {
            this.emit("message", message);
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
      } catch (error) {
        /* istanbul ignore next */
        this.emit("error", error);
      }
    }, this.pollingInterval);
  }
}

export { SQSListener, Listener };
