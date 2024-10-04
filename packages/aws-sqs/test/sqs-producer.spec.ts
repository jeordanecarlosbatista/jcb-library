import path from "path";
import { v4 as uuid } from "uuid";

import { config } from "dotenv";
config({ path: path.join(__dirname, ".env") });

import { SQSProvider } from "@/sqs-provider";
import { SQSProducerClient } from "@/sqs-producer";
import { ConsoleLogger } from "@jeordanecarlosbatista/jcb-logger";
import { faker } from "@faker-js/faker/.";

const envs = {
  AWS_SQS_ENDPOINT: process.env.AWS_SQS_ENDPOINT,
  AWS_SQS_BASE_URL: process.env.AWS_SQS_BASE_URL,
};

type TestSetup = {
  sqsProducer: SQSProducerClient;
  sqsProvider: SQSProvider;
};

const makeTestSetup = (): TestSetup => {
  const sqsProvider = new SQSProvider(envs.AWS_SQS_ENDPOINT);
  const logger = new ConsoleLogger();

  const sqsProducer = new SQSProducerClient(sqsProvider, logger);

  return { sqsProducer, sqsProvider };
};

describe(SQSProducerClient.name, () => {
  describe("enqueueMessage", () => {
    it("should enqueue message in fifo queue", async () => {
      const { sqsProducer, sqsProvider } = makeTestSetup();

      const queueName = `${faker.string.alphanumeric(10)}.fifo`;
      const { QueueUrl } = await sqsProvider.createQueue(queueName);

      await sqsProducer.enqueueMessage({
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

      await sqsProducer.enqueueMessage({
        queueName,
        payload: "Hello, world!",
      });

      const receiveResult = await sqsProvider.receiveMessage({
        QueueUrl,
      });
      expect(receiveResult.Messages).toHaveLength(1);
    });
  });

  describe("enqueueMessageBatch", () => {
    it("should enqueue fifo queue", async () => {
      const { sqsProducer, sqsProvider } = makeTestSetup();

      const queueName = `${faker.string.uuid()}.fifo`;
      const { QueueUrl } = await sqsProvider.createQueue(queueName);

      const maxTotalMessage = faker.number.int({ min: 1, max: 10 });
      await sqsProducer.enqueueMessageBatch({
        queueName,
        payload: Array.from({ length: maxTotalMessage }, () => "Hello, world!"),
        messageDeduplicationId: uuid(),
        messageGroupId: uuid(),
      });

      const receiveResult = await sqsProvider.receiveMessage({
        QueueUrl,
      });
      expect(receiveResult.Messages).toHaveLength(1);
    });

    it("should send message standard queue", async () => {
      const { sqsProducer, sqsProvider } = makeTestSetup();

      const queueName = `${faker.string.uuid()}.fifo`;
      const { QueueUrl } = await sqsProvider.createQueue(queueName);

      const maxTotalMessage = faker.number.int({ min: 1, max: 10 });
      await sqsProducer.enqueueMessageBatch({
        queueName,
        payload: Array.from({ length: maxTotalMessage }, () => "Hello, world!"),
        messageDeduplicationId: uuid(),
        messageGroupId: uuid(),
      });

      const receiveResult = await sqsProvider.receiveMessage({
        QueueUrl,
      });
      expect(receiveResult.Messages).toHaveLength(1);
    });
  });
});
