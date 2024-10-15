import { QueueListener } from "@lib/queue-listener";
import { Message } from "@aws-sdk/client-sqs";
import { z } from "zod";

class TestQueueListener extends QueueListener {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleMessage(_message: Message): Promise<void> {
    // Do nothing
  }
}

describe(QueueListener.name, () => {
  let queueListener: TestQueueListener;

  beforeEach(() => {
    queueListener = new TestQueueListener();
  });

  it("should call resolveCallback with parsed message", async () => {
    const message: Message = {
      Body: JSON.stringify({ message: "Hello, world!" }),
    } as Message;

    const schema = z.object({
      message: z.string(),
    });

    const resolveCallback = jest.fn().mockResolvedValue(undefined);
    const payloadErrorCallback = jest.fn().mockResolvedValue(undefined);

    await queueListener.resolveWith({
      message,
      schema,
      resolveCallback,
      payloadErrorCallback,
    });

    expect(resolveCallback).toHaveBeenCalledWith({ message: "Hello, world!" });
    expect(payloadErrorCallback).not.toHaveBeenCalled();
  });

  it("should call payloadErrorCallback with validation errors", async () => {
    const message: Message = {
      Body: JSON.stringify({ msg: "Hello, world!" }),
    } as Message;

    const schema = z.object({
      message: z.string(),
    });

    const resolveCallback = jest.fn().mockResolvedValue(undefined);
    const payloadErrorCallback = jest.fn().mockResolvedValue(undefined);

    await queueListener.resolveWith({
      message,
      schema,
      resolveCallback,
      payloadErrorCallback,
    });

    expect(resolveCallback).not.toHaveBeenCalled();
    expect(payloadErrorCallback).toHaveBeenCalled();
  });

  it("should throw an error if message is not a non-null object", async () => {
    const message: Message = {
      Body: "null",
    } as Message;

    const schema = z.object({
      message: z.string(),
    });

    const resolveCallback = jest.fn().mockResolvedValue(undefined);
    const payloadErrorCallback = jest.fn().mockResolvedValue(undefined);

    await expect(
      queueListener.resolveWith({
        message,
        schema,
        resolveCallback,
        payloadErrorCallback,
      })
    ).rejects.toThrow("Message must be a non-null object");

    expect(resolveCallback).not.toHaveBeenCalled();
    expect(payloadErrorCallback).not.toHaveBeenCalled();
  });

  it("should throw an error with validation errors if payloadErrorCallback is not provided", async () => {
    const message: Message = {
      Body: JSON.stringify({ msg: "Hello, world!" }),
    } as Message;

    const schema = z.object({
      message: z.string(),
    });

    const resolveCallback = jest.fn().mockResolvedValue(undefined);

    await expect(
      queueListener.resolveWith({
        message,
        schema,
        resolveCallback,
      })
    ).rejects.toThrow(/"message":/);

    expect(resolveCallback).not.toHaveBeenCalled();
  });

  describe("toMessageDLQ", () => {
    it("should call producer.enqueue with the correct arguments", async () => {
      const enqueueSpy = jest
        .spyOn(queueListener["producer"], "enqueue")
        .mockImplementation();

      await queueListener.toMessageDLQ({
        queueName: "queueName",
        payload: { message: "Hello, world!" },
      });

      expect(enqueueSpy).toHaveBeenCalledWith({
        payload: { message: "Hello, world!" },
        queueName: "queueName",
      });
    });
  });
});
