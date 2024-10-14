import { SqsProducer } from "@lib/sqs-producer";
import { SQSClient } from "@aws-sdk/client-sqs";
import { ConsoleLogger } from "@jeordanecarlosbatista/jcb-logger";
import { SQSProducerClientSingleton } from "@lib/sqs-producer-client-singleton";

jest.mock("@aws-sdk/client-sqs");
jest.mock("@lib/sqs-provider");
jest.mock("@jeordanecarlosbatista/jcb-logger");

describe("SQSProducerClientSingleton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the same instance on multiple calls", () => {
    const instance1 = SQSProducerClientSingleton.getInstance();
    const instance2 = SQSProducerClientSingleton.getInstance();

    expect(instance1).toBe(instance2);
  });

  it("should configure SQSProvider and ConsoleLogger correctly", () => {
    const mockSQSClient = new SQSClient({
      endpoint: process.env.AWS_SQS_ENDPOINT,
      region: process.env.AWS_REGION,
    });
    const mockLogger = new ConsoleLogger();

    (SQSClient as jest.Mock).mockImplementation(() => mockSQSClient);
    (ConsoleLogger as jest.Mock).mockImplementation(() => mockLogger);

    const instance = SQSProducerClientSingleton.getInstance();

    expect(SQSClient).toHaveBeenCalledWith({
      endpoint: process.env.AWS_SQS_ENDPOINT,
      region: process.env.AWS_REGION,
    });
    expect(ConsoleLogger).toHaveBeenCalled();
    expect(instance).toBeInstanceOf(SqsProducer);
  });
});
