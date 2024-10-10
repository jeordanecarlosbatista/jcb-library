import { ListenerManager } from "@jeordanecarlosbatista/jcb-aws-sqs";

interface TestSetup {
  run(callback: () => Promise<void>): Promise<void>;
  tearDown(): Promise<void>;
}

type TestSetupArguments = {
  queues: ListenerManager;
};

class TestSetupManager implements TestSetup {
  private readonly queues: ListenerManager;

  constructor(args: TestSetupArguments) {
    this.queues = args.queues;
  }

  run(callback: () => Promise<void>): Promise<void> {
    this.queues.start();
    return callback();
  }

  tearDown(): Promise<void> {
    this.queues.stop();
    return Promise.resolve();
  }
}

export { TestSetupManager, TestSetup, TestSetupArguments };
