import { faker } from "@faker-js/faker";

import { QueueListenerManaged } from "@jeordanecarlosbatista/jcb-aws-sqs";
import { TestSetupSQS } from "@lib/test-setup-queue";
import { retry } from "async";

describe(TestSetupSQS.name, () => {
  const testSetupSQS = new TestSetupSQS({
    listenerManager: new QueueListenerManaged({
      pollingInterval: 1000,
      receiveMaxNumberOfMessages: 1,
      waitTimeSeconds: 20,
      queues: [],
    }),
  });

  describe("sendMessage", () => {
    it("should send a message to a queue", async () => {
      const queueName = faker.string.alphanumeric(10);
      await testSetupSQS.sqsClient.createQueue(queueName);

      await testSetupSQS.sendMessage({
        payload: "Hello, World!",
        queueName: queueName,
      });

      retry({ times: 30, interval: 300 }, async () => {
        const message = await testSetupSQS.receiveMessages(queueName);
        expect(message).toMatchObject({
          Messages: [
            {
              Body: "Hello, World!",
              MessageId: expect.any(String),
              ReceiptHandle: expect.any(String),
            },
          ],
        });
      });
    });
  });

  describe("getAttributes", () => {
    it("should return the queue attributes", async () => {
      const queueName = faker.string.alphanumeric(10);
      await testSetupSQS.sqsClient.createQueue(queueName);

      const attributes = await testSetupSQS.getAttributes(queueName);

      expect(attributes).toMatchObject({
        Attributes: {
          ApproximateNumberOfMessages: "0",
          ApproximateNumberOfMessagesDelayed: "0",
          ApproximateNumberOfMessagesNotVisible: "0",
        },
      });
    });
  });

  describe("purgeQueue", () => {
    it("should purge the queue", async () => {
      const queueName = faker.string.alphanumeric(10);
      await testSetupSQS.sqsClient.createQueue(queueName);

      await testSetupSQS.sendMessage({
        payload: "Hello, World!",
        queueName: queueName,
      });

      await testSetupSQS.purgeQueue(queueName);

      const attributes = await testSetupSQS.getAttributes(queueName);

      expect(attributes).toMatchObject({
        Attributes: {
          ApproximateNumberOfMessages: "0",
          ApproximateNumberOfMessagesDelayed: "0",
          ApproximateNumberOfMessagesNotVisible: "0",
        },
      });
    });
  });
});
