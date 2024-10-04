import { Message } from "@aws-sdk/client-sqs";
import { SQSListener } from "./sqs-listener";

export class SQSExampleListener extends SQSListener<string> {
  private isToDLQ: boolean = false;

  messages: Message[] = [];

  async handle(message: Message) {
    if (this.isToDLQ) {
      return this.toDlq(message);
    }

    this.messages.push(message);
  }

  enableToDql() {
    this.isToDLQ = true;
  }
}
