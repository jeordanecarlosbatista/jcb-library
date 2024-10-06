import { EnqueueMessageParams } from "./producer";
import SQSProducerClientSingleton from "./sqs-producer-client-singleton";

export interface EnqueueParams {
  queueName: string;
  payload: string | object;
  messageDeduplicationId?: string;
  messageGroupId?: string;
}

export abstract class Enqueuer {
  private readonly producerClient = SQSProducerClientSingleton.getInstance();

  constructor() {}

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
