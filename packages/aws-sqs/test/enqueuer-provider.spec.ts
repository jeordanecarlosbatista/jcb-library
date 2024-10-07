import { Enqueuer, EnqueuerProvider, SQSEnqueuerProvider } from "@lib/enqueuer";

describe("EnqueuerProvider", () => {
  it("should return an instance of SQSEnqueuerProvider", () => {
    const enqueuer: Enqueuer = EnqueuerProvider.factory();
    expect(enqueuer).toBeInstanceOf(SQSEnqueuerProvider);
  });
});
