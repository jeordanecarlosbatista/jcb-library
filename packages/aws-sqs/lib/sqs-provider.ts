import {
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  SendMessageBatchCommand,
  SendMessageBatchCommandInput,
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";

export class SQSProvider {
  private client: SQSClient;

  constructor(endpoint: string) {
    this.client = new SQSClient({ endpoint });
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
}
