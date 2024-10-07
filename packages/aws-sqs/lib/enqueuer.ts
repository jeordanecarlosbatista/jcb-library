import { SQSProducerClientSingleton } from "@lib/sqs-producer-client-singleton";

interface EnqueueParams {
  queueName: string;
  payload: string | object;
  messageDeduplicationId?: string;
  messageGroupId?: string;
}

interface Enqueuer {
  enqueue(params: EnqueueParams): Promise<void>;
}

class SQSEnqueuerProvider implements Enqueuer {
  private readonly producerClient = SQSProducerClientSingleton.getInstance();

  async enqueue(params: EnqueueParams): Promise<void> {
    return this.producerClient.enqueue({
      queueName: params.queueName,
      payload: params.payload,
      messageDeduplicationId: params.messageDeduplicationId,
      messageGroupId: params.messageGroupId,
    });
  }
}

class EnqueuerProvider {
  static factory(): Enqueuer {
    return new SQSEnqueuerProvider();
  }
}

export { EnqueueParams, Enqueuer, SQSEnqueuerProvider, EnqueuerProvider };
