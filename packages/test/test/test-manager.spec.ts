import { ListenerManager } from "@jeordanecarlosbatista/jcb-aws-sqs";
import { TestSetupManager } from "@lib/test-manager";

describe(TestSetupManager.name, () => {
  it("should be defined", () => {
    const mockQueues = {
      start: jest.fn(),
      stop: jest.fn(),
    } as unknown as ListenerManager;
    const testSetupManager = new TestSetupManager({ queues: mockQueues });
    expect(testSetupManager).toBeDefined();
  });

  it("should call start on queues and execute callback in run method", async () => {
    const mockQueues = {
      start: jest.fn(),
      stop: jest.fn(),
    } as unknown as ListenerManager;
    const testSetupManager = new TestSetupManager({ queues: mockQueues });
    const callback = jest.fn().mockResolvedValue(undefined);

    await testSetupManager.run(callback);

    expect(mockQueues.start).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it("should call stop on queues in tearDown method", async () => {
    const mockQueues = {
      start: jest.fn(),
      stop: jest.fn(),
    } as unknown as ListenerManager;
    const testSetupManager = new TestSetupManager({ queues: mockQueues });

    await testSetupManager.tearDown();

    expect(mockQueues.stop).toHaveBeenCalled();
  });
});
