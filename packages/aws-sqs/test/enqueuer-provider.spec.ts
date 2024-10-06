import { Enqueuer, EnqueuerProvider, SQSEnqueuerProvider } from "@/enqueuer";

describe("EnqueuerProvider", () => {
  it("should return an instance of SQSEnqueuerProvider", () => {
    const enqueuer: Enqueuer = EnqueuerProvider.factory();
    expect(enqueuer).toBeInstanceOf(SQSEnqueuerProvider);
  });
});
