import { v4 as uuid } from "uuid";
import { retry } from "async";
import assert from "node:assert";

import { faker } from "@faker-js/faker/.";
import { SQSProvider } from "@lib/sqs-provider";
import { Message, SQSClient } from "@aws-sdk/client-sqs";
import { SqsProducer } from "@lib/sqs-producer";
import { ConsoleLogger } from "@jeordanecarlosbatista/jcb-logger";
import { QueueListener } from "@lib/queue-listener";
import { QueueListenerManaged } from "@lib/manager/queue-listener-manager";

class TestQueueListener extends QueueListener {
  handleMessageWithError = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleMessage(_message: Message): Promise<void> {
    if (this.handleMessageWithError) {
      throw new Error("Error");
    }
  }
}

const makeTestSetup = () => {
  const sqsCLient = new SQSClient({ endpoint: process.env.AWS_SQS_ENDPOINT });
  const logger = new ConsoleLogger();
  const sqsProvider = new SQSProvider(sqsCLient);
  const sqsProducer = new SqsProducer(sqsProvider, logger);
  const listener = new TestQueueListener();

  return { sqsProducer, sqsProvider, listener, sqsCLient };
};

describe(QueueListenerManaged.name, () => {
  jest.setTimeout(30000);

  it("should listen to messages success", async () => {
    const { sqsProducer, sqsProvider, listener } = makeTestSetup();

    const queueName = faker.string.alphanumeric(10);
    const { QueueUrl } = await sqsProvider.createQueue(queueName);
    assert(QueueUrl);

    const queueListenerManaged = new QueueListenerManaged({
      pollingInterval: 300,
      receiveMaxNumberOfMessages: 1,
      waitTimeSeconds: 300,
      queues: [
        {
          queueName,
          dql: {
            queueName: `${queueName}-dql`,
          },
          listener,
        },
      ],
    });
    queueListenerManaged.start();

    const messages = [
      { Id: uuid(), MessageBody: "Message 1" },
      { Id: uuid(), MessageBody: "Message 2" },
      { Id: uuid(), MessageBody: "Message 3" },
    ];

    await sqsProducer.enqueue({
      queueName,
      payload: messages,
    });

    let totalMessage;
    await retry({ times: 50, interval: 300 }, async () => {
      const attributes = await sqsProvider.getQueueAttributes(QueueUrl);
      assert(
        attributes.Attributes?.ApproximateNumberOfMessages === "0",
        "No messages in queue"
      );
      totalMessage =
        attributes.Attributes?.ApproximateNumberOfMessagesNotVisible;
    });
    expect(totalMessage).toBe("0");

    queueListenerManaged.stop();
  });

  it("should listen to messages with error", async () => {
    const { sqsProducer, sqsProvider, listener } = makeTestSetup();
    listener.handleMessageWithError = true;

    const queueName = faker.string.alphanumeric(10);
    const { QueueUrl } = await sqsProvider.createQueue(queueName);
    assert(QueueUrl);

    const queueListenerManaged = new QueueListenerManaged({
      pollingInterval: 300,
      receiveMaxNumberOfMessages: 1,
      waitTimeSeconds: 300,
      queues: [
        {
          queueName,
          dql: {
            queueName: `${queueName}-dql`,
          },
          listener,
        },
      ],
    });
    queueListenerManaged.start();

    const messages = [
      { Id: uuid(), MessageBody: "Message 1" },
      { Id: uuid(), MessageBody: "Message 2" },
      { Id: uuid(), MessageBody: "Message 3" },
    ];

    await sqsProducer.enqueue({
      queueName,
      payload: messages,
    });

    let totalMessage;
    await retry({ times: 50, interval: 300 }, async () => {
      const attributes = await sqsProvider.getQueueAttributes(QueueUrl);
      assert(
        attributes.Attributes?.ApproximateNumberOfMessages === "0",
        "No messages in queue"
      );
      totalMessage =
        attributes.Attributes?.ApproximateNumberOfMessagesNotVisible;
    });
    expect(totalMessage).toBe("3");

    queueListenerManaged.stop();
  });

  it("should return all queue urls", async () => {
    const { sqsProvider, listener } = makeTestSetup();

    const queueName = faker.string.alphanumeric(10);
    const { QueueUrl } = await sqsProvider.createQueue(queueName);
    assert(QueueUrl);

    const queueListenerManaged = new QueueListenerManaged({
      pollingInterval: 300,
      receiveMaxNumberOfMessages: 1,
      waitTimeSeconds: 300,
      queues: [
        {
          queueName,
          dql: {
            queueName: `${queueName}-dlq`,
          },
          listener,
        },
      ],
    });

    const queueUrls = queueListenerManaged.getAllQueueUrls();
    expect(queueUrls).toEqual([
      `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`,
      `${process.env.SQS_QUEUE_BASE_URL}/${queueName}-dlq`,
    ]);
  });

  describe("addListener", () => {
    it("should add a listener", async () => {
      const { sqsProvider } = makeTestSetup();
      const queueListenerManaged = new QueueListenerManaged({
        pollingInterval: 300,
        receiveMaxNumberOfMessages: 1,
        waitTimeSeconds: 300,
        queues: [],
      });

      const queueName = faker.string.alphanumeric(10);
      await sqsProvider.createQueue(queueName);

      queueListenerManaged.addListener(queueName, new TestQueueListener());
      queueListenerManaged.start();

      const queues = queueListenerManaged.getAllQueueUrls();
      expect(queues).toHaveLength(1);

      queueListenerManaged.stop();
    });
  });
});
