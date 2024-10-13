import { ListenerManager } from "@jeordanecarlosbatista/jcb-aws-sqs";
import { SQSProvider } from "@jeordanecarlosbatista/jcb-aws-sqs/dist/sqs-provider";

interface TestSetup {
  run(callback: () => Promise<void>): Promise<void>;
  tearDown(): Promise<void>;
}

type TestSetupArguments = {
  listenerManager: ListenerManager;
  sqsProvider: SQSProvider;
};

class TestSetupManager implements TestSetup {
  private readonly listenerManager: ListenerManager;
  private readonly sqsProvider: SQSProvider;

  constructor(args: TestSetupArguments) {
    this.listenerManager = args.listenerManager;
    this.sqsProvider = args.sqsProvider;
  }

  async run(callback: () => Promise<void>): Promise<void> {
    try {
      await this.purgeQueues();

      this.listenerManager.start();
      await callback();
    } finally {
      this.tearDown();
    }
  }

  tearDown(): Promise<void> {
    this.listenerManager.stop();
    return Promise.resolve();
  }

  private async purgeQueues() {
    for (const queueUrl of this.listenerManager.getAllQueueUrls()) {
      await this.sqsProvider.purgeQueue(queueUrl);
    }
  }
}

export { TestSetupManager, TestSetup, TestSetupArguments };
