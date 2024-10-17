export interface TestSetupService {
  run(): Promise<void>;
  tearDown(): Promise<void>;
}
