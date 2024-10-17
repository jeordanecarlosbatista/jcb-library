import { retry } from "async";
import { Message } from "@aws-sdk/client-sqs";
import {
  QueueListener,
  QueueListenerManaged,
} from "@jeordanecarlosbatista/jcb-aws-sqs";
import { TestSetupSQS } from "@lib/test-setup-queue";
import { IntegrationTestManage } from "@lib/test-manager";
import { faker } from "@faker-js/faker/.";

class listenerManagerMock extends QueueListener {
  async handleMessage(message: Message): Promise<void> {
    await Promise.resolve(message);
  }
}

class TestSetup extends IntegrationTestManage {
  private queueSetup: TestSetupSQS | undefined;

  constructor() {
    super();
  }

  queue = () => {
    this.queueSetup = new TestSetupSQS({
      listenerManager: new QueueListenerManaged({
        pollingInterval: 1000,
        receiveMaxNumberOfMessages: 1,
        waitTimeSeconds: 20,
        queues: [],
      }),
    });

    return this.queueSetup;
  };

  override async run(callback: () => Promise<void>): Promise<void> {
    await callback().finally(() => this.queueSetup?.tearDown());
  }
}

describe(IntegrationTestManage.name, () => {
  jest.setTimeout(30000);

  describe("run", () => {
    it("should call the callback", async () => {
      const testSetup = new TestSetup();
      const queue = testSetup.queue();

      const queueName = faker.string.alphanumeric(10);
      await queue.sqsClient.createQueue(queueName);

      queue.listenerManager.addListener(queueName, new listenerManagerMock());

      await queue.run();
      await testSetup.run(async () => {
        await queue.sendMessage({
          payload: "Hello, World!",
          queueName: queueName,
        });

        await retry({ times: 50, interval: 300 }, async () => {
          const messages = await queue.getAttributes(queueName);
          expect(messages.Attributes?.ApproximateNumberOfMessages).toBe("0");
        });
      });
    });
  });
});
