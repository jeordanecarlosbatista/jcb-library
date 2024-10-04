import { Message } from "@aws-sdk/client-sqs";
import { Logger } from "@jeordanecarlosbatista/jcb-logger";
import { Consumer } from "sqs-consumer";
import { SQSProvider } from "@/sqs-provider";
import { v4 as uuid } from "uuid";

export type ReceiveMessage = Message;

interface SQSListenerConfig<T> {
  sqsProvider: SQSProvider;
  queueName: T;
  dlqQueueName: T;
  logger: Logger;
}

export abstract class SQSListener<T> {
  private readonly sqsQueueBaseUrl = process.env.SQS_QUEUE_BASE_URL;
  private consumer: Consumer;

  constructor(private config: SQSListenerConfig<T>) {
    this.config.logger.log({
      message: "Starting SQSConsumer",
      logData: {
        queueUrl: `${this.sqsQueueBaseUrl}/${this.config.queueName}`,
      },
    });

    this.consumer = Consumer.create({
      queueUrl: `${this.sqsQueueBaseUrl}/${this.config.queueName}`,
      visibilityTimeout: 1,
      handleMessage: async (message: ReceiveMessage) => {
        await this.handle(message);
        await this.config.sqsProvider.deleteMessage({
          QueueUrl: `${this.sqsQueueBaseUrl}/${this.config.queueName}`,
          ReceiptHandle: message.ReceiptHandle,
        });
      },
    });

    this.consumer.start();

    /* istanbul ignore next */
    this.consumer.on("started", () => {
      this.config.logger.log({
        message: "SQSConsumer started",
      });
    });

    this.consumer.on("error", (err) => {
      this.config.logger.log({
        message: "An error occurred in the SQSConsumer",
        logData: {
          error: err,
        },
      });
    });

    /* istanbul ignore next */
    this.consumer.on("processing_error", (err) => {
      this.config.logger.log({
        message: "An error occurred while processing a message",
        logData: {
          error: err,
        },
      });
    });
  }

  stop() {
    this.consumer.stop({ abort: true });
  }

  abstract handle(message: ReceiveMessage): Promise<void>;

  async toDlq(message: ReceiveMessage): Promise<void> {
    this.config.logger.log({
      message: "Moving message to DLQ",
      logData: {
        queueName: this.config.dlqQueueName,
        message,
      },
    });

    await this.config.sqsProvider.sendMessage({
      QueueUrl: `${this.sqsQueueBaseUrl}/${this.config.dlqQueueName}`,
      MessageBody: JSON.stringify(message.Body),
      MessageGroupId: uuid(),
      MessageDeduplicationId: uuid(),
    });
  }
}
