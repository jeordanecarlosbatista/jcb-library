import { retry } from "async";
import { randomUUID } from "node:crypto";
import { Message } from "@aws-sdk/client-sqs";
import {
  QueueListener,
  QueueListenerManaged,
} from "@jeordanecarlosbatista/jcb-aws-sqs";
import { TestSetupSQS } from "@lib/test-setup-queue";
import { IntegrationTestManage } from "@lib/test-manager";

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
        queues: [
          {
            queueName: "hello-world.fifo",
            listener: new listenerManagerMock(),
          },
        ],
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

      await testSetup.run(async () => {
        await queue.sendMessage({
          payload: "Hello, World!",
          queueName: "hello-world.fifo",
          messageGroupId: randomUUID(),
          messageDeduplicationId: randomUUID(),
        });

        await retry({ times: 50, interval: 300 }, async () => {
          const messages = await queue.getAttributes("hello-world.fifo");
          expect(messages.Attributes?.ApproximateNumberOfMessages).toBe("0");
        });
      });
    });
  });
});
