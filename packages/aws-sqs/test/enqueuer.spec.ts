import { Enqueuer, EnqueueParams } from "@/enqueuer";
import { SQSProducerClient } from "@/sqs-producer";
import SQSProducerClientSingleton from "@/sqs-producer-client-singleton";

class TestEnqueuer extends Enqueuer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async enqueueMessage(_params: EnqueueParams): Promise<void> {}
}

describe(Enqueuer.name, () => {
  let mockProducerClient: jest.Mocked<SQSProducerClient>;
  let enqueuer: Enqueuer;

  beforeEach(() => {
    mockProducerClient = {
      enqueue: jest.fn(),
    } as unknown as jest.Mocked<SQSProducerClient>;

    jest
      .spyOn(SQSProducerClientSingleton, "getInstance")
      .mockReturnValue(mockProducerClient);

    enqueuer = new TestEnqueuer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call producerClient.enqueue with correct parameters", async () => {
    const params: EnqueueParams = {
      queueName: "test-queue.fifo",
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
});
