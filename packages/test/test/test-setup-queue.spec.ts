import { faker } from "@faker-js/faker";

import {
  QueueListener,
  QueueListenerManaged,
} from "@jeordanecarlosbatista/jcb-aws-sqs";
import { TestSetupSQS } from "@lib/test-setup-queue";
import { retry } from "async";

class listenerManagerMock extends QueueListener {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleMessage(message: any): Promise<void> {
    await Promise.resolve(message);
  }
}

describe(TestSetupSQS.name, () => {
  jest.setTimeout(30000);

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

  describe("purgeQueues", () => {
    const testSetupSQS = new TestSetupSQS({
      listenerManager: new QueueListenerManaged({
        pollingInterval: 1000,
        receiveMaxNumberOfMessages: 1,
        waitTimeSeconds: 20,
        queues: [],
      }),
    });

    it("should purge all queues", async () => {
      const queueName1 = faker.string.alphanumeric(10);
      const queueName2 = faker.string.alphanumeric(10);
      await testSetupSQS.sqsClient.createQueue(queueName1);
      await testSetupSQS.sqsClient.createQueue(queueName2);

      testSetupSQS.listenerManager.addListener(
        queueName1,
        new listenerManagerMock()
      );
      testSetupSQS.listenerManager.addListener(
        queueName2,
        new listenerManagerMock()
      );

      await testSetupSQS.sendMessage({
        payload: "Hello, World!",
        queueName: queueName1,
      });
      await testSetupSQS.sendMessage({
        payload: "Hello, World!",
        queueName: queueName2,
      });

      await retry({ times: 30, interval: 300 }, async () => {
        const attributes1 = await testSetupSQS.getAttributes(queueName1);
        const attributes2 = await testSetupSQS.getAttributes(queueName2);

        expect(attributes1).toMatchObject({
          Attributes: {
            ApproximateNumberOfMessages: "1",
            ApproximateNumberOfMessagesDelayed: "0",
            ApproximateNumberOfMessagesNotVisible: "0",
          },
        });

        expect(attributes2).toMatchObject({
          Attributes: {
            ApproximateNumberOfMessages: "1",
            ApproximateNumberOfMessagesDelayed: "0",
            ApproximateNumberOfMessagesNotVisible: "0",
          },
        });
      });

      await testSetupSQS.purgeQueues();

      const attributes1 = await testSetupSQS.getAttributes(queueName1);
      const attributes2 = await testSetupSQS.getAttributes(queueName2);
      expect(attributes1).toMatchObject({
        Attributes: {
          ApproximateNumberOfMessages: "0",
          ApproximateNumberOfMessagesDelayed: "0",
          ApproximateNumberOfMessagesNotVisible: "0",
        },
      });

      expect(attributes2).toMatchObject({
        Attributes: {
          ApproximateNumberOfMessages: "0",
          ApproximateNumberOfMessagesDelayed: "0",
          ApproximateNumberOfMessagesNotVisible: "0",
        },
      });

      await testSetupSQS.tearDown();
    });
  });
});
