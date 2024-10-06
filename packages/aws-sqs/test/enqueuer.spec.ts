import { Enqueuer, EnqueueParams } from "@/enqueuer";
import { SQSProducerClient } from "@/sqs-producer";
import SQSProducerClientSingleton from "@/sqs-producer-client-singleton";
import { SQSProvider } from "@/sqs-provider";
import { SQSClient } from "@aws-sdk/client-sqs";
import { faker } from "@faker-js/faker/.";
import { ConsoleLogger } from "@jeordanecarlosbatista/jcb-logger";

class TestEnqueuer extends Enqueuer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async enqueueMessage(_params: EnqueueParams): Promise<void> {}
}

const makeTestSetup = () => {
  const sqsCLient = new SQSClient({ endpoint: process.env.AWS_SQS_ENDPOINT });

  const sqsProvider = new SQSProvider(sqsCLient);
  const logger = new ConsoleLogger();

  const sqsProducer = new SQSProducerClient(sqsProvider, logger);

  return { sqsProducer, sqsProvider };
};

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
    const { sqsProvider } = makeTestSetup();
    const queueName = `${faker.string.alphanumeric(10)}.fifo`;
    await sqsProvider.createQueue(queueName);

    const params: EnqueueParams = {
      queueName: queueName,
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
