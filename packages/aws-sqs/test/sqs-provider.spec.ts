import path from "path";
import { faker } from "@faker-js/faker";

import { config } from "dotenv";
config({ path: path.join(__dirname, ".env") });

import { SQSProvider } from "@/sqs-provider";

const envs = {
  AWS_SQS_ENDPOINT: process.env.AWS_SQS_ENDPOINT,
};

type TestSetup = {
  sqsProvider: SQSProvider;
};

const makeTestSetup = (): TestSetup => {
  const sqsProvider = new SQSProvider(envs.AWS_SQS_ENDPOINT);

  return { sqsProvider };
};

describe(SQSProvider.name, () => {
  describe("sendMessage", () => {
    it("should send a message to fifo queue", async () => {
      const { sqsProvider } = makeTestSetup();

      const { QueueUrl } = await sqsProvider.createQueue(
        `${faker.string.alphanumeric(10)}.fifo`
      );

      await sqsProvider.sendMessage({
        QueueUrl,
        MessageBody: "Hello, world!",
        MessageGroupId: faker.string.uuid(),
        MessageDeduplicationId: faker.string.uuid(),
      });

      const receiveResult = await sqsProvider.receiveMessage({
        QueueUrl,
        MaxNumberOfMessages: 1,
      });
      expect(receiveResult.Messages).toHaveLength(1);
    });

    it("should send a message to standard queue", async () => {
      const { sqsProvider } = makeTestSetup();

      const { QueueUrl } = await sqsProvider.createQueue(
        faker.string.alphanumeric(10)
      );

      await sqsProvider.sendMessage({
        QueueUrl,
        MessageBody: "Hello, world!",
      });

      const receiveResult = await sqsProvider.receiveMessage({
        QueueUrl,
      });
      expect(receiveResult.Messages).toHaveLength(1);
    });
  });

  describe("sendMessageBatch", () => {
    it("should send a batch of messages to the SQS queue", async () => {
      const { sqsProvider } = makeTestSetup();

      const { QueueUrl } = await sqsProvider.createQueue(
        `${faker.string.alphanumeric()}.fifo`
      );

      const maxTotalMessage = faker.number.int({ min: 5, max: 10 });
      await sqsProvider.sendMessageBatch({
        QueueUrl,
        Entries: Array.from({ length: maxTotalMessage }, () => ({
          Id: faker.string.uuid(),
          MessageBody: faker.string.alphanumeric(),
          MessageGroupId: faker.string.uuid(),
          MessageDeduplicationId: faker.string.uuid(),
        })),
      });

      const receiveResult = await sqsProvider.receiveMessage({
        QueueUrl,
        MaxNumberOfMessages: maxTotalMessage,
      });
      expect(receiveResult.Messages).toHaveLength(maxTotalMessage);
    });
  });
});