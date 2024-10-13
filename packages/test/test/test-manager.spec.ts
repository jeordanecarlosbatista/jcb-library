import { ListenerManager } from "@jeordanecarlosbatista/jcb-aws-sqs";
import { SQSProvider } from "@jeordanecarlosbatista/jcb-aws-sqs/dist/sqs-provider";
import { TestSetupManager } from "@lib/test-manager";

describe(TestSetupManager.name, () => {
  it("should be defined", () => {
    const listenerManager = {
      start: jest.fn(),
      stop: jest.fn(),
      getAllQueueUrls: jest.fn(),
    } as unknown as ListenerManager;
    const mockSqsProvider = {} as unknown as SQSProvider;
    const testSetupManager = new TestSetupManager({
      listenerManager: listenerManager,
      sqsProvider: mockSqsProvider,
    });
    expect(testSetupManager).toBeDefined();
  });

  it("should call start on queues and execute callback in run method", async () => {
    const listenerManager = {
      start: jest.fn(),
      stop: jest.fn(),
      getAllQueueUrls: jest.fn().mockImplementation(() => []),
    } as unknown as ListenerManager;
    const mockSqsProvider = {} as unknown as SQSProvider;
    const testSetupManager = new TestSetupManager({
      listenerManager,
      sqsProvider: mockSqsProvider,
    });
    const callback = jest.fn().mockResolvedValue(undefined);

    await testSetupManager.run(callback);

    expect(listenerManager.start).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it("should call stop on queues in tearDown method", async () => {
    const listenerManager = {
      start: jest.fn(),
      stop: jest.fn(),
    } as unknown as ListenerManager;
    const testSetupManager = new TestSetupManager({
      listenerManager,
      sqsProvider: {} as unknown as SQSProvider,
    });

    await testSetupManager.tearDown();

    expect(listenerManager.stop).toHaveBeenCalled();
  });

  it("should call purgeQueue on all queues in tearDown method", async () => {
    const listenerManager = {
      start: jest.fn(),
      stop: jest.fn(),
      getAllQueueUrls: jest.fn().mockImplementation(() => ["url1", "url2"]),
    } as unknown as ListenerManager;
    const sqsProvider = {
      purgeQueue: jest.fn(),
    } as unknown as SQSProvider;
    const testSetupManager = new TestSetupManager({
      listenerManager,
      sqsProvider,
    });

    await testSetupManager.run(jest.fn().mockResolvedValue(undefined));

    expect(sqsProvider.purgeQueue).toHaveBeenCalledTimes(2);
    expect(sqsProvider.purgeQueue).toHaveBeenCalledWith("url1");
    expect(sqsProvider.purgeQueue).toHaveBeenCalledWith("url2");
  });
});
