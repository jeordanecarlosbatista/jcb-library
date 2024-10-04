import { v4 as uuid } from "uuid";
import assert from "node:assert";
import retry from "async-await-retry";
import path from "path";
import { config } from "dotenv";
config({ path: path.join(__dirname, ".env") });

import { SQSProvider } from "@/sqs-provider";
import { ConsoleLogger } from "@jeordanecarlosbatista/jcb-logger";
import { SQSExampleListener } from "@/sqs-example-listener";
import { faker } from "@faker-js/faker/.";
import { SQSProducerClient } from "@/sqs-producer";

type TestSetupContext = {
  queueName: string;
  dlqQueueName: string;
  sqsProvider: SQSProvider;
  exampleListener: SQSExampleListener;
  logger: ConsoleLogger;
  producer: SQSProducerClient;
};

type TestSetupCallback = (context: TestSetupContext) => Promise<void>;
const testSetup = async (callback: TestSetupCallback) => {
  const sqsProvider = new SQSProvider(process.env.AWS_SQS_ENDPOINT);
  const logger = new ConsoleLogger();
  const producer = new SQSProducerClient(sqsProvider, logger);

  const queueName = `${faker.string.alphanumeric(10)}.fifo`;
  const dlqQueueName = `${faker.string.alphanumeric(10)}-dlq.fifo`;

  await sqsProvider.createQueue(queueName);
  await sqsProvider.createQueue(dlqQueueName);

  const exampleListener = new SQSExampleListener({
    logger,
    queueName,
    dlqQueueName,
    sqsProvider,
  });

  try {
    await callback({
      sqsProvider,
      exampleListener,
      logger,
      queueName,
      dlqQueueName,
      producer,
    });
  } finally {
    exampleListener.stop();
    sqsProvider.destroy();
  }
};

describe(SQSExampleListener.name, () => {
  describe("handle", () => {
    it("should receive message from queue", async () => {
      await testSetup(async ({ producer, exampleListener, queueName }) => {
        await producer.enqueueMessage({
          queueName,
          payload: "Hello, world!",
          messageDeduplicationId: uuid(),
          messageGroupId: uuid(),
        });

        await retry(
          () => {
            assert(
              exampleListener.messages.length > 0,
              "Messages should be defined"
            );
          },
          null,
          { retriesMax: 50, interval: 300 }
        );
        expect(exampleListener.messages).toHaveLength(1);
        expect(exampleListener.messages[0].Body).toBe("Hello, world!");
      });
    });
  });

  describe("toDlq", () => {
    it("should move message to DLQ", async () => {
      await testSetup(
        async ({
          sqsProvider,
          producer,
          exampleListener,
          queueName,
          dlqQueueName,
        }) => {
          exampleListener.enableToDql();
          await producer.enqueueMessage({
            queueName,
            payload: "Hello, world!",
            messageDeduplicationId: uuid(),
            messageGroupId: uuid(),
          });

          await retry(
            async () => {
              const receiveResult = await sqsProvider.receiveMessage({
                QueueUrl: `${process.env.SQS_QUEUE_BASE_URL}/${dlqQueueName}`,
              });
              expect(receiveResult.Messages).toHaveLength(1);
            },
            null,
            { retriesMax: 50, interval: 300 }
          );
        }
      );
    });
  });
});
