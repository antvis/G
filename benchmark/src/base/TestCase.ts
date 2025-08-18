import type { TestOptions, TestResult, TestMetrics } from './types';

export abstract class TestCase<T> {
  abstract readonly name: string;
  private metrics: TestMetrics = {
    execute: { duration: 0 },
    cleanup: { duration: 0 },
  };
  private success = true;
  private error: string | undefined;

  async run(
    app: T,
    options: TestOptions,
    extra: { engineName: string; testSuiteName: string },
  ): Promise<TestResult> {
    const engineName = extra.engineName;
    const testSuiteName = extra.testSuiteName;
    const caseName = this.constructor.name;

    try {
      await this.setup(app, options);

      // 记录执行前内存
      this.recordMemory('beforeExecute');

      // 执行测试阶段
      const executeMark = `${engineName}-${testSuiteName}-${caseName}-execute-start`;
      performance.mark(executeMark);
      const executeStartTime = performance.now();
      await this.execute(app, options);
      this.metrics.execute.duration = performance.now() - executeStartTime;
      performance.measure(
        `${engineName}-${testSuiteName}-${caseName}-execute`,
        executeMark,
      );

      // 记录执行后内存
      this.recordMemory('afterExecute');

      // 记录清理前内存
      this.recordMemory('beforeCleanup');

      // 执行清理阶段
      const cleanupMark = `${engineName}-${testSuiteName}-${caseName}-cleanup-start`;
      performance.mark(cleanupMark);
      const cleanupStartTime = performance.now();
      await this.cleanup(app);
      this.metrics.cleanup.duration = performance.now() - cleanupStartTime;
      performance.measure(
        `${engineName}-${testSuiteName}-${caseName}-cleanup`,
        cleanupMark,
      );

      // 记录清理后内存
      this.recordMemory('afterCleanup');
    } catch (e) {
      this.success = false;
      this.error = e instanceof Error ? e.message : String(e);
    }

    return {
      engine: engineName,
      testSuite: testSuiteName,
      case: caseName,
      success: this.success,
      error: this.error,
      metrics: this.metrics,
    };
  }

  protected async setup(_app: T, _options: TestOptions): Promise<void> {}

  protected abstract execute(app: T, options: TestOptions): Promise<void>;

  protected async cleanup(_app: T): Promise<void> {}

  private recordMemory(
    phase: 'beforeExecute' | 'afterExecute' | 'beforeCleanup' | 'afterCleanup',
  ): void {
    const memory = window.performance?.memory;
    if (!memory) return;

    // 确定目标指标
    const isExecutePhase =
      phase === 'beforeExecute' || phase === 'afterExecute';
    const targetMetrics = isExecutePhase
      ? this.metrics.execute
      : this.metrics.cleanup;
    const isBeforePhase =
      phase === 'beforeExecute' || phase === 'beforeCleanup';

    // 初始化内存指标
    if (!targetMetrics.memory) {
      targetMetrics.memory = {
        beforeJSHeapSize: memory.usedJSHeapSize,
        afterJSHeapSize: memory.usedJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }

    // 更新内存指标
    if (isBeforePhase) {
      targetMetrics.memory.beforeJSHeapSize = memory.usedJSHeapSize;
    } else {
      targetMetrics.memory.afterJSHeapSize = memory.usedJSHeapSize;
    }
  }
}
