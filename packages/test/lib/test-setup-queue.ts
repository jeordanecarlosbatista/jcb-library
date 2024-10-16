import {
  Enqueuer,
  EnqueuerProvider,
  ListenerManager,
  SQSProvider,
} from "@jeordanecarlosbatista/jcb-aws-sqs";
import { EnqueueParams } from "@jeordanecarlosbatista/jcb-aws-sqs/dist/enqueuer";

type TestSetupSQSArguments = {
  listenerManager: ListenerManager;
};

export class TestSetupSQS {
  private readonly listenerManager: ListenerManager;
  private readonly sqsProvider: SQSProvider;
  private readonly enqueuer: Enqueuer;

  constructor(args: TestSetupSQSArguments) {
    this.listenerManager = args.listenerManager;
    this.sqsProvider = SQSProvider.factory();
    this.enqueuer = EnqueuerProvider.factory();

    this.run();
  }

  get sqsClient() {
    return this.sqsProvider;
  }

  sendMessage(message: EnqueueParams): Promise<void> {
    return this.enqueuer.enqueue(message);
  }

  receiveMessages(queueName: string) {
    return this.sqsProvider.receiveMessage({
      QueueUrl: `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`,
    });
  }

  getAttributes(queueName: string) {
    return this.sqsProvider.getQueueAttributes(
      `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`
    );
  }

  private async run(): Promise<void> {
    await this.purgeQueues();
    this.listenerManager.start();
  }

  async tearDown(): Promise<void> {
    return Promise.resolve(this.listenerManager.stop());
  }

  async purgeQueue(queueName: string) {
    return this.sqsProvider.purgeQueue(
      `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`
    );
  }

  private async purgeQueues() {
    return Promise.all(
      this.listenerManager
        .getAllQueueUrls()
        .map((queueUrl) => this.sqsProvider.purgeQueue(queueUrl))
    );
  }
}
