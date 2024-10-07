import { SqsProducer } from "@lib/sqs-producer";
import { SQSProvider } from "@lib/sqs-provider";
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
    const mockSQSProvider = new SQSProvider(mockSQSClient);
    const mockLogger = new ConsoleLogger();

    (SQSClient as jest.Mock).mockImplementation(() => mockSQSClient);
    (SQSProvider as jest.Mock).mockImplementation(() => mockSQSProvider);
    (ConsoleLogger as jest.Mock).mockImplementation(() => mockLogger);

    const instance = SQSProducerClientSingleton.getInstance();

    expect(SQSClient).toHaveBeenCalledWith({
      endpoint: process.env.AWS_SQS_ENDPOINT,
      region: process.env.AWS_REGION,
    });
    expect(SQSProvider).toHaveBeenCalledWith(mockSQSClient);
    expect(ConsoleLogger).toHaveBeenCalled();
    expect(instance).toBeInstanceOf(SqsProducer);
  });
});
