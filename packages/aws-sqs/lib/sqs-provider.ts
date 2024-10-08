import {
  CreateQueueCommand,
  CreateQueueCommandInput,
  DeleteMessageCommand,
  DeleteMessageCommandInput,
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  SendMessageBatchCommand,
  SendMessageBatchCommandInput,
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";

class SQSProvider {
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

  async deleteMessage(command: DeleteMessageCommandInput) {
    return this.client.send(new DeleteMessageCommand(command));
  }

  async getQueueAttributes(queueUrl: string) {
    return this.client.send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ["All"],
      })
    );
  }

  // destroy() {
  //   this.client.destroy();
  // }
}

export { SQSProvider };
