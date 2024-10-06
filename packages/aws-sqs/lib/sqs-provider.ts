import {
  CreateQueueCommand,
  CreateQueueCommandInput,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  SendMessageBatchCommand,
  SendMessageBatchCommandInput,
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";

export class SQSProvider {
  constructor(private readonly client: SQSClient) {}

  async createQueue(
    queueName: string,
    attributes?: CreateQueueCommandInput["Attributes"]
  ) {
    return this.client.send(
      new CreateQueueCommand({
        QueueName: queueName,
        Attributes: {
          FifoQueue: queueName.endsWith(".fifo") ? "true" : undefined,
          ...attributes,
        },
      })
    );
  }

  async sendMessage(args: SendMessageCommandInput) {
    return this.client.send(new SendMessageCommand(args));
  }

  async sendMessageBatch(args: SendMessageBatchCommandInput) {
    return this.client.send(new SendMessageBatchCommand(args));
  }

  async receiveMessage(command: ReceiveMessageCommandInput) {
    return this.client.send(new ReceiveMessageCommand(command));
  }

  // async deleteMessage(command: DeleteMessageCommandInput) {
  //   return this.client.send(new DeleteMessageCommand(command));
  // }

  // destroy() {
  //   this.client.destroy();
  // }
}
