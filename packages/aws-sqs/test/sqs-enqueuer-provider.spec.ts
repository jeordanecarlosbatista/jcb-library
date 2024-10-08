import { EnqueueParams, SQSEnqueuerProvider } from "@lib/enqueuer";
import { SQSProducerClientSingleton } from "@lib/sqs-producer-client-singleton";

jest.mock("@lib/sqs-producer-client-singleton");

describe("SQSEnqueuerProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call enqueue on the producer client", async () => {
    const mockEnqueue = jest.fn();
    (SQSProducerClientSingleton.getInstance as jest.Mock).mockReturnValue({
      enqueue: mockEnqueue,
    });

    const enqueuerProvider = new SQSEnqueuerProvider();
    const params: EnqueueParams = {
      queueName: "testQueue",
      payload: { key: "value" },
    };

    await enqueuerProvider.enqueue(params);

    expect(mockEnqueue).toHaveBeenCalledWith({
      queueName: "testQueue",
      payload: { key: "value" },
      messageDeduplicationId: undefined,
      messageGroupId: undefined,
    });
  });
});
