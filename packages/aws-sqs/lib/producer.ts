import {
  SendMessageBatchCommandInput,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";

export type MessagePayload = SendMessageCommandInput;
export type MessageBatchPayload = SendMessageBatchCommandInput;

export type EnqueueMessageParams = {
  queueName: string;
  payload: string | object | Array<string | object>;
  messageDeduplicationId?: string;
  messageGroupId?: string;
  attributes?: MessagePayload["MessageAttributes"];
};

export type EnqueueMessageBatchParams = {
  queueName: string;
  payload: Array<string | object>;
  messageDeduplicationId?: string;
  messageGroupId?: string;
  attributes?: MessagePayload["MessageAttributes"];
};

export interface MessageEnqueuer {
  enqueue(params: EnqueueMessageParams): Promise<void>;
}
