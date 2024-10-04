import { SQSProvider } from "@/sqs-provider";
import {
  EnqueueMessageBatchParams,
  EnqueueMessageParams,
  MessageEnqueuer,
} from "@/producer";
import { Logger } from "@jeordanecarlosbatista/jcb-logger";

export class SQSProducerClient implements MessageEnqueuer {
  constructor(
    private readonly sqsClient: SQSProvider,
    private readonly logger: Logger
  ) {}

  async enqueueMessage(params: EnqueueMessageParams): Promise<void> {
    this.logger.log({
      level: "info",
      message: "Sending message",
      logData: {
        context: "sqs",
        timestamp: new Date().toISOString(),
        sqsData: { queueName: params.queueName, payload: params.payload },
      },
    });

    await this.sqsClient.sendMessage({
      QueueUrl: `${process.env.SQS_QUEUE_BASE_URL}/${params.queueName}`,
      MessageBody: params.payload,
      MessageDeduplicationId: params.messageDeduplicationId,
      MessageGroupId: params.messageGroupId,
      MessageAttributes: {
        ...params.attributes,
      },
    });

    this.logger.log({
      level: "info",
      message: "Message sent",
      logData: {
        context: "sqs",
        timestamp: new Date().toISOString(),
        sqsData: { queueName: params.queueName, payload: params.payload },
      },
    });
  }

  async enqueueMessageBatch(params: EnqueueMessageBatchParams): Promise<void> {
    this.logger.log({
      message: "Sending message",
      logData: {
        context: "sqs",
        timestamp: new Date().toISOString(),
        sqsData: { queueName: params.queueName, payload: params.payload },
      },
    });
    await this.sqsClient.sendMessageBatch({
      QueueUrl: `${process.env.SQS_QUEUE_BASE_URL}/${params.queueName}`,
      Entries: params.payload.map((message, index) => ({
        Id: index.toString(),
        MessageBody:
          /* istanbul ignore next */
          typeof message === "object" && message !== null
            ? JSON.stringify(message)
            : (message as string),
        MessageDeduplicationId: params.messageDeduplicationId,
        MessageGroupId: params.messageGroupId,
        MessageAttributes: {
          ...params.attributes,
        },
      })),
    });
    this.logger.log({
      message: "Message sent",
      logData: {
        context: "sqs",
        timestamp: new Date().toISOString(),
        sqsData: { queueName: params.queueName, payload: params.payload },
      },
    });
  }
}
