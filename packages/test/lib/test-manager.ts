/* istanbul ignore file */

import { TestSetupService } from "./test-setup-service";

export abstract class IntegrationTestManage {
  constructor() {}

  async run(
    services: TestSetupService[],
    callback: (services: TestSetupService[]) => Promise<void>
  ): Promise<void> {
    for (const service of services) {
      await service.run();
    }

    await callback(services);

    for (const service of services) {
      await service.tearDown();
    }
  }
}
