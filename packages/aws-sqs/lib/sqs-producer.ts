import { MessageEnqueuer } from "@lib/producer";
import { SQSProvider } from "@lib/sqs-provider";
import { Logger } from "@jeordanecarlosbatista/jcb-logger";
import { EnqueueMessageParams } from "@lib/producer";
import { EnqueueMessageBatchParams } from "@lib/producer";

class SqsProducer implements MessageEnqueuer {
  constructor(
    private readonly provider: SQSProvider,
    private readonly logger: Logger
  ) {}

  async enqueue(params: EnqueueMessageParams): Promise<void> {
    this.logger.log({
      level: "info",
      message: "Sending message",
      logData: {
        context: "sqs",
        timestamp: new Date().toISOString(),
        sqsData: { queueName: params.queueName, payload: params.payload },
      },
    });

    if (Array.isArray(params.payload)) {
      await this.sendMessageBatch({
        queueName: params.queueName,
        payload: params.payload,
        messageDeduplicationId: params.messageDeduplicationId,
        messageGroupId: params.messageGroupId,
        attributes: params.attributes,
      });
    } else {
      await this.sendMessage({
        queueName: params.queueName,
        payload: params.payload,
        messageDeduplicationId: params.messageDeduplicationId,
        messageGroupId: params.messageGroupId,
        attributes: params.attributes,
      });
    }

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

  private async sendMessage(params: EnqueueMessageParams): Promise<void> {
    await this.provider.sendMessage({
      QueueUrl: `${process.env.SQS_QUEUE_BASE_URL}/${params.queueName}`,
      MessageBody:
        /* istanbul ignore next */
        typeof params.payload === "string"
          ? params.payload
          : typeof params.payload === "object"
          ? JSON.stringify(params.payload)
          : "",
      MessageDeduplicationId: params.messageDeduplicationId,
      MessageGroupId: params.messageGroupId,
      MessageAttributes: {
        ...params.attributes,
      },
    });
  }

  private async sendMessageBatch(
    params: EnqueueMessageBatchParams
  ): Promise<void> {
    await this.provider.sendMessageBatch({
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
  }
}

export { SqsProducer };
