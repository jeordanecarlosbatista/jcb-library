/* istanbul ignore file */

import { TestSetupService } from "./test-setup-service";

export abstract class IntegrationTestManage {
  constructor() {}

  async run(
    services: TestSetupService[],
    callback: () => Promise<void>
  ): Promise<void> {
    for (const service of services) {
      await service.run();
    }

    await callback();

    for (const service of services) {
      await service.tearDown();
    }
  }
}
