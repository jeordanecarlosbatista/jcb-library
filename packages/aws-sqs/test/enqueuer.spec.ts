import { Enqueuer, EnqueueParams } from "@/enqueuer";
import { SQSProducerClient } from "@/sqs-producer";

class TestEnqueuer extends Enqueuer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async enqueueMessage(_params: EnqueueParams): Promise<void> {}
}

describe("Enqueuer", () => {
  let mockProducerClient: jest.Mocked<SQSProducerClient>;
  let enqueuer: Enqueuer;

  beforeEach(() => {
    mockProducerClient = {
      enqueue: jest.fn(),
    } as unknown as jest.Mocked<SQSProducerClient>;

    enqueuer = new TestEnqueuer(mockProducerClient);
  });

  it("should call producerClient.enqueue with correct parameters", async () => {
    const params: EnqueueParams = {
      queueName: "test-queue",
      payload: "test-payload",
      messageDeduplicationId: "dedup-id",
      messageGroupId: "group-id",
    };

    await enqueuer.enqueue(params);

    expect(mockProducerClient.enqueue).toHaveBeenCalledWith({
      queueName: params.queueName,
      payload: params.payload,
      messageDeduplicationId: params.messageDeduplicationId,
      messageGroupId: params.messageGroupId,
    });
  });

  it("should call producerClient.enqueue with only required parameters", async () => {
    const params: EnqueueParams = {
      queueName: "test-queue",
      payload: "test-payload",
    };

    await enqueuer.enqueue(params);

    expect(mockProducerClient.enqueue).toHaveBeenCalledWith({
      queueName: params.queueName,
      payload: params.payload,
      messageDeduplicationId: undefined,
      messageGroupId: undefined,
    });
  });
});
