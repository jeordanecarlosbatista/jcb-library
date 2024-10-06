import { EnqueueMessageParams } from "./producer";
import { SQSProducerClient } from "./sqs-producer";

export interface EnqueueParams {
  queueName: string;
  payload: string | object;
  messageDeduplicationId?: string;
  messageGroupId?: string;
}

export abstract class Enqueuer {
  constructor(private readonly producerClient: SQSProducerClient) {}

  abstract enqueueMessage(params: EnqueueMessageParams): Promise<void>;

  async enqueue(params: EnqueueParams): Promise<void> {
    this.producerClient.enqueue({
      queueName: params.queueName,
      payload: params.payload,
      messageDeduplicationId: params.messageDeduplicationId,
      messageGroupId: params.messageGroupId,
    });
  }
}
