import { SQSProvider } from "@/sqs-provider";
import {
  MessageBatchPayload,
  MessageEnqueuer,
  MessagePayload,
} from "@/producer";
import { Logger } from "@jeordanecarlosbatista/logger";

export class SQSProducerClient implements MessageEnqueuer {
  constructor(
    private readonly sqsClient: SQSProvider,
    private readonly logger: Logger
  ) {}

  async enqueueMessage(message: MessagePayload): Promise<void> {
    this.logger.log({
      level: "info",
      message: "Sending message",
      logData: {
        context: "sqs",
        timestamp: new Date().toISOString(),
        sqsData: message,
      },
    });

    await this.sqsClient.sendMessage(message);

    this.logger.log({
      level: "info",
      message: "Message sent",
      logData: {
        context: "sqs",
        timestamp: new Date().toISOString(),
        sqsData: message,
      },
    });
  }

  async enqueueMessageBatch(message: MessageBatchPayload): Promise<void> {
    this.logger.log({
      message: "Sending message",
      logData: {
        context: "sqs",
        timestamp: new Date().toISOString(),
        sqsData: message,
      },
    });
    await this.sqsClient.sendMessageBatch(message);
    this.logger.log({
      message: "Message sent",
      logData: {
        context: "sqs",
        timestamp: new Date().toISOString(),
        sqsData: message,
      },
    });
  }
}
