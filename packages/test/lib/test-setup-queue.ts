import {
  Enqueuer,
  EnqueuerProvider,
  ListenerManager,
  SQSProvider,
} from "@jeordanecarlosbatista/jcb-aws-sqs";
import { EnqueueParams } from "@jeordanecarlosbatista/jcb-aws-sqs/dist/enqueuer";
import { TestSetupService } from "./test-setup-service";

type TestSetupSQSArguments = {
  listenerManager: ListenerManager;
};

export class TestSetupSQS implements TestSetupService {
  readonly listenerManager: ListenerManager;
  private readonly sqsProvider: SQSProvider;
  private readonly enqueuer: Enqueuer;

  constructor(args: TestSetupSQSArguments) {
    this.listenerManager = args.listenerManager;
    this.sqsProvider = SQSProvider.factory();
    this.enqueuer = EnqueuerProvider.factory();
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

  async run(): Promise<void> {
    this.listenerManager.start();
  }

  async tearDown(): Promise<void> {
    this.listenerManager.stop();
    return Promise.resolve();
  }

  async purgeQueue(queueName: string) {
    return this.sqsProvider.purgeQueue(
      `${process.env.SQS_QUEUE_BASE_URL}/${queueName}`
    );
  }

  async purgeQueues() {
    const queueUrls = this.listenerManager.getAllQueueUrls();
    await Promise.all(
      queueUrls.map((queueUrl) => this.sqsProvider.purgeQueue(queueUrl))
    );
  }
}
