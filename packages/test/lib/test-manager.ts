/* istanbul ignore file */

export abstract class IntegrationTestManage {
  constructor() {}

  async run(callback: () => Promise<void>): Promise<void> {
    await callback();
  }
}
