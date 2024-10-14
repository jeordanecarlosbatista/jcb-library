import { ListenerManager } from "@jeordanecarlosbatista/jcb-aws-sqs";
import { TestSetupManager } from "@lib/test-manager";

describe(TestSetupManager.name, () => {
  it("should be defined", () => {
    const listenerManager = {
      start: jest.fn(),
      stop: jest.fn(),
      getAllQueueUrls: jest.fn(),
    } as unknown as ListenerManager;
    const testSetupManager = new TestSetupManager({
      listenerManager: listenerManager,
    });
    expect(testSetupManager).toBeDefined();
  });

  it("should call start on queues and execute callback in run method", async () => {
    const listenerManager = {
      start: jest.fn(),
      stop: jest.fn(),
      getAllQueueUrls: jest.fn().mockImplementation(() => []),
    } as unknown as ListenerManager;
    const testSetupManager = new TestSetupManager({
      listenerManager,
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
    });

    await testSetupManager.tearDown();

    expect(listenerManager.stop).toHaveBeenCalled();
  });

  it("should call purgeQueue on all queues in tearDown method", async () => {
    const listenerManager = {
      start: jest.fn(),
      stop: jest.fn(),
      getAllQueueUrls: jest.fn().mockImplementation(() => []),
    } as unknown as ListenerManager;
    const testSetupManager = new TestSetupManager({
      listenerManager,
    });

    await testSetupManager.run(jest.fn().mockResolvedValue(undefined));
  });
});
