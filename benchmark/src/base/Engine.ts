import type { TestSuite, TestResult, TestOptions } from './types';

export abstract class Engine<T> {
  abstract name: string;
  protected app!: T;
  protected testSuiteMap: Map<string, TestSuite<T>> = new Map();

  abstract initialize(container: HTMLElement): Promise<void>;
  abstract destroy(): Promise<void>;

  addTestSuite(testSuite: TestSuite<T>): void {
    this.testSuiteMap.set(testSuite.name, testSuite);
  }

  getTestSuiteNames(): string[] {
    return Array.from(this.testSuiteMap.keys());
  }

  async testSuite(
    testSuiteName: string,
    options: TestOptions,
    extra: { onTestComplete?: (result: TestResult) => void },
  ): Promise<TestResult[]> {
    const result: TestResult[] = [];
    const cases = this.testSuiteMap.get(testSuiteName)?.cases || [];

    for (const testCase of cases) {
      let testResult: TestResult;

      try {
        testResult = await testCase.run(this.app, options, {
          engineName: this.name,
          testSuiteName,
        });
      } catch (error) {
        testResult = {
          engine: this.name,
          testSuite: testSuiteName,
          case: testCase.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }

      result.push(testResult);

      if (extra.onTestComplete) {
        extra.onTestComplete(testResult);
      }
    }

    return result;
  }
}
