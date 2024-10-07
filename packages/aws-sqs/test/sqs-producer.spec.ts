import { v4 as uuid } from "uuid";
import { ConsoleLogger } from "@jeordanecarlosbatista/jcb-logger";
import { faker } from "@faker-js/faker/.";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SqsProducer } from "@lib/sqs-producer";
import { SQSProvider } from "@lib/sqs-provider";

const makeTestSetup = () => {
  const sqsCLient = new SQSClient({ endpoint: process.env.AWS_SQS_ENDPOINT });

  const sqsProvider = new SQSProvider(sqsCLient);
  const logger = new ConsoleLogger();

  const sqsProducer = new SqsProducer(sqsProvider, logger);

  return { sqsProducer, sqsProvider };
};

describe(SqsProducer.name, () => {
  describe("enqueueMessage", () => {
    it("should enqueue message in fifo queue", async () => {
      const { sqsProducer, sqsProvider } = makeTestSetup();

      const queueName = `${faker.string.alphanumeric(10)}.fifo`;
      const { QueueUrl } = await sqsProvider.createQueue(queueName);

      await sqsProducer.enqueue({
        queueName,
        payload: "Hello, world!",
        messageDeduplicationId: uuid(),
        messageGroupId: uuid(),
      });

      const receiveResult = await sqsProvider.receiveMessage({
        QueueUrl,
      });
      expect(receiveResult.Messages).toHaveLength(1);
    });

    it("should enqueue message in standard queue", async () => {
      const { sqsProducer, sqsProvider } = makeTestSetup();

      const queueName = faker.string.alphanumeric(10);
      const { QueueUrl } = await sqsProvider.createQueue(queueName);

      await sqsProducer.enqueue({
        queueName,
        payload: "Hello, world!",
      });

      const receiveResult = await sqsProvider.receiveMessage({
        QueueUrl,
      });
      expect(receiveResult.Messages).toHaveLength(1);
    });

    it("should enqueue messages in batch", async () => {
      const { sqsProvider, sqsProducer } = makeTestSetup();

      const queueName = faker.string.alphanumeric(10);
      const { QueueUrl } = await sqsProvider.createQueue(queueName);

      const messages = [
        { Id: uuid(), MessageBody: "Message 1" },
        { Id: uuid(), MessageBody: "Message 2" },
        { Id: uuid(), MessageBody: "Message 3" },
      ];

      await sqsProducer.enqueue({
        queueName,
        payload: messages,
      });

      const receiveResult = await sqsProvider.receiveMessage({
        QueueUrl,
        MaxNumberOfMessages: 10,
      });

      expect(receiveResult.Messages).toHaveLength(3);
    });
  });
});
