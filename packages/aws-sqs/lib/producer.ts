import {
  SendMessageBatchCommandInput,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";

export type MessagePayload = SendMessageCommandInput;
export type MessageBatchPayload = SendMessageBatchCommandInput;

export interface MessageEnqueuer {
  enqueueMessage(message: MessagePayload): Promise<void>;
  enqueueMessageBatch(message: MessageBatchPayload): Promise<void>;
}
