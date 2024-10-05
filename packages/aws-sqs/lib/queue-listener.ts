/* eslint-disable @typescript-eslint/no-explicit-any */

import { Message } from "@aws-sdk/client-sqs";
import { z } from "zod";

export interface QueueResolveWithInput<
  TSchema extends z.ZodType<any, any> = z.ZodType<any, any>
> {
  message: Message;
  schema: TSchema;
  resolveCallback: (message: z.infer<TSchema>) => Promise<void>;
  payloadErrorCallback?: (
    errors: z.typeToFlattenedError<z.infer<TSchema>, string>
  ) => Promise<void>;
}

export abstract class QueueListener {
  abstract handleMessage(message: Message): Promise<void>;

  async resolveWith<TSchema extends z.ZodType<any, any>>(
    args: QueueResolveWithInput<TSchema>
  ): Promise<void> {
    const { message, schema, resolveCallback, payloadErrorCallback } = args;
    const parsedMessage = JSON.parse(message.Body as string);

    if (typeof parsedMessage !== "object" || parsedMessage === null) {
      throw new Error("Message must be a non-null object");
    }

    const result = schema.safeParse(parsedMessage);

    if (!result.success) {
      if (payloadErrorCallback) {
        return await payloadErrorCallback(result.error.flatten());
      }
      throw new Error(JSON.stringify(result.error.flatten()));
    }

    return await resolveCallback(result.data);
  }
}
