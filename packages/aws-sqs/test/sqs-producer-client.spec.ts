import path from "path";
import { v4 as uuid } from "uuid";

import { config } from "dotenv";
config({ path: path.join(__dirname, ".env") });

import retry from "async-await-retry";
import { SQSProvider } from "@/sqs-provider";
import assert from "node:assert";
import { SQSProducerClient } from "@/sqs-producer";
import { ConsoleLogger } from "@jeordanecarlosbatista/logger";

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
    it("should enqueue a message to the SQS queue", async () => {
      const { sqsProducer, sqsProvider } = makeTestSetup();

      await sqsProducer.enqueueMessage({
        QueueUrl: `${envs.AWS_SQS_BASE_URL}/test-queue.fifo`,
        MessageBody: "Hello, world!",
        MessageGroupId: uuid(),
        MessageDeduplicationId: uuid(),
      });

      await retry(async () => {
        const receiveResult = await sqsProvider.receiveMessage({
          QueueUrl: `${envs.AWS_SQS_BASE_URL}/test-queue.fifo`,
        });

        assert(receiveResult.Messages.length > 0, "Messages should be defined");

        expect(receiveResult.Messages).toHaveLength(1);
        expect(receiveResult.Messages[0].Body).toBe("Hello, world!");
      });
    });
  });

  describe("enqueueMessageBatch", () => {
    it("should enqueue a batch of messages to the SQS queue", async () => {
      const { sqsProducer, sqsProvider } = makeTestSetup();

      const maxTotalMessage = 10;
      await sqsProducer.enqueueMessageBatch({
        QueueUrl: `${envs.AWS_SQS_BASE_URL}/test-queue.fifo`,
        Entries: Array.from({ length: maxTotalMessage }, () => ({
          Id: uuid(),
          MessageBody: "Hello, world!",
          MessageGroupId: uuid(),
          MessageDeduplicationId: uuid(),
        })),
      });

      await retry(async () => {
        const receiveResult = await sqsProvider.receiveMessage({
          QueueUrl: `${envs.AWS_SQS_BASE_URL}/test-queue.fifo`,
        });

        assert(receiveResult.Messages.length > 0, "Messages should be defined");
      });
    });
  });
});
