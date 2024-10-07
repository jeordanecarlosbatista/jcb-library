import {
  EnqueuerProvider,
  SQSEnqueuerProvider,
  EnqueueParams,
} from "@lib/enqueuer";
import { SQSProducerClientSingleton } from "@lib/sqs-producer-client-singleton";

jest.mock("@lib/sqs-producer-client-singleton");

describe("EnqueuerProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return an instance of SQSEnqueuerProvider", () => {
    const enqueuer = EnqueuerProvider.factory();
    expect(enqueuer).toBeInstanceOf(SQSEnqueuerProvider);
  });

  it("should call enqueue on the producer client", async () => {
    const mockEnqueue = jest.fn();
    (SQSProducerClientSingleton.getInstance as jest.Mock).mockReturnValue({
      enqueue: mockEnqueue,
    });

    const enqueuer = EnqueuerProvider.factory();
    const params: EnqueueParams = {
      queueName: "testQueue",
      payload: { key: "value" },
    };

    await enqueuer.enqueue(params);

    expect(mockEnqueue).toHaveBeenCalledWith({
      queueName: "testQueue",
      payload: { key: "value" },
      messageDeduplicationId: undefined,
      messageGroupId: undefined,
    });
  });
});
