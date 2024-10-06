import SQSProducerClientSingleton from "./sqs-producer-client-singleton";

export interface EnqueueParams {
  queueName: string;
  payload: string | object;
  messageDeduplicationId?: string;
  messageGroupId?: string;
}

export interface Enqueuer {
  enqueue(params: EnqueueParams): Promise<void>;
}

export class SQSEnqueuerProvider implements Enqueuer {
  private readonly producerClient = SQSProducerClientSingleton.getInstance();

  async enqueue(params: EnqueueParams): Promise<void> {
    await this.producerClient.enqueue({
      queueName: params.queueName,
      payload: params.payload,
      messageDeduplicationId: params.messageDeduplicationId,
      messageGroupId: params.messageGroupId,
    });
  }
}

export class EnqueuerProvider {
  static factory(): Enqueuer {
    return new SQSEnqueuerProvider();
  }
}
