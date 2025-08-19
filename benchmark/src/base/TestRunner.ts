import type { TestResult, TestOptions } from './types';
import type { Engine } from './Engine';
import { EventEmitter } from 'eventemitter3';

export interface TestRunnerEvents<T> {
  start: [engines: Engine<T>[]];
  engineStart: [event: { engine: Engine<T>; index: number }];
  testSuiteStart: [event: { testSuiteName: string; engine: Engine<T> }];
  testComplete: [event: { result: TestResult }];
  testSuiteComplete: [event: { testSuiteName: string; results: TestResult[] }];
  engineComplete: [event: { engine: Engine<T>; results: TestResult[] }];
  stop: [event: { results: TestResult[] }];
  complete: [event: { results: TestResult[] }];
  error: [
    event: {
      error: Error;
      context?: {
        engine?: Engine<T>;
        testSuiteName?: string;
      };
    },
  ];
  stopping: [];
  log: [message: string];
  progress: [
    event: {
      // 整体进度
      current: number; // 当前完成的测试用例数
      total: number; // 总测试用例数
      progress: number; // 进度百分比 (0-100)

      // 时间统计
      time: {
        elapsed: number; // 已用时间（秒）
        remaining: number; // 预计剩余时间（秒）
        avgPerCase: number; // 平均每个测试用例耗时（秒）
      };

      // 引擎级别
      engine: {
        current: number; // 当前是第几个引擎
        total: number; // 总共有多少个引擎
        name: string; // 当前引擎名称
      };

      // 测试套件级别
      suite: {
        current: number; // 当前是第几个测试套件
        total: number; // 当前引擎总共有多少个测试套件
        name: string; // 当前测试套件名称
      };

      // 测试用例级别
      testCase: {
        current: number; // 当前是第几个测试用例
        total: number; // 当前测试套件总共有多少个测试用例
        name: string; // 当前测试用例名称
      };
    },
  ];
}

export class TestRunner<T = unknown> extends EventEmitter<TestRunnerEvents<T>> {
  static readonly Events = {
    START: 'start',
    ENGINE_START: 'engineStart',
    TEST_SUITE_START: 'testSuiteStart',
    TEST_COMPLETE: 'testComplete',
    TEST_SUITE_COMPLETE: 'testSuiteComplete',
    ENGINE_COMPLETE: 'engineComplete',
    STOP: 'stop',
    COMPLETE: 'complete',
    ERROR: 'error',
    STOPPING: 'stopping',
    LOG: 'log',
    PROGRESS: 'progress',
  } as const;

  private results: TestResult[] = [];
  private isRunning = false;
  private stopRequested = false;
  private currentCaseIndex = 0;
  private totalTestCases = 0;
  private completedTestCases = 0;
  private currentEngineIndex = 0;
  private currentSuiteIndex = 0;

  constructor(private engines: Engine<T>[]) {
    super();
  }

  getTestCaseGroupNames() {
    return Array.from(
      new Set(this.engines.map((engine) => engine.getTestSuiteNames()).flat()),
    );
  }

  private async getTestSuiteCaseCounts(): Promise<number[]> {
    const counts: number[] = [];
    console.log(
      'Getting test suite case counts for:',
      this.currentCaseGroupNames,
    );

    for (const suiteName of this.currentCaseGroupNames) {
      // 查找第一个包含该测试套件的引擎
      let caseCount = 0;
      for (const engine of this.engines) {
        const suite = engine.getTestSuite(suiteName);
        if (suite) {
          console.log(
            `Suite ${suiteName} found in engine ${engine.name} with ${suite.cases.length} cases`,
          );
          caseCount = suite.cases.length;
          break;
        }
      }

      if (caseCount === 0) {
        console.warn(`Suite ${suiteName} not found in any engine`);
      }
      counts.push(caseCount);
    }

    console.log('Final case counts:', counts);
    return counts;
  }

  private emitProgress() {
    console.log('emitProgress called, totalTestCases:', this.totalTestCases);
    if (this.totalTestCases > 0) {
      const now = Date.now();
      const progress = Math.min(
        100,
        Math.round((this.completedTestCases / this.totalTestCases) * 100),
      );
      const currentEngine = this.engines[this.currentEngineIndex];
      const currentSuiteName =
        this.currentCaseGroupNames[this.currentSuiteIndex];

      // 获取当前测试套件
      let currentSuite = null;
      if (currentEngine && currentSuiteName) {
        currentSuite = currentEngine.getTestSuite(currentSuiteName);
      }

      // 计算时间统计
      const elapsed = (now - this.startTime) / 1000; // 转换为秒
      const remainingCases = this.totalTestCases - this.completedTestCases;
      const avgTimePerCase =
        this.completedTestCases > 0 ? elapsed / this.completedTestCases : 0;
      const estimatedRemaining = remainingCases * avgTimePerCase;

      // 限制进度更新频率（最多每秒更新一次）
      if (now - this.lastEmitTime < 1000 && progress < 100) {
        return;
      }
      this.lastEmitTime = now;

      const progressEvent = {
        // 整体进度
        current: this.completedTestCases,
        total: this.totalTestCases,
        progress,

        // 时间统计
        time: {
          elapsed: Math.round(elapsed * 10) / 10, // 保留一位小数
          remaining: Math.round(estimatedRemaining * 10) / 10,
          avgPerCase: Math.round(avgTimePerCase * 1000) / 1000, // 保留三位小数
        },

        // 引擎级别
        engine: {
          current: this.currentEngineIndex + 1,
          total: this.engines.length,
          name: currentEngine?.name || 'unknown',
        },

        // 测试套件级别
        suite: {
          current: this.currentSuiteIndex + 1,
          total: this.currentCaseGroupNames.length,
          name: currentSuiteName || 'unknown',
        },

        // 测试用例级别
        testCase: {
          current: this.currentCaseIndex + 1,
          total: currentSuite?.cases.length || 0,
          name: currentSuite?.cases[this.currentCaseIndex]?.name || 'unknown',
        },
      };

      console.log('Emitting progress event:', progressEvent);
      this.emit(TestRunner.Events.PROGRESS, progressEvent);
    }
  }

  // 不再需要这个map，因为测试套件存储在各自的引擎中
  private currentCaseGroupNames: string[] = [];
  private startTime: number = 0;
  private lastEmitTime: number = 0;

  async runTests(
    caseGroupNames: string[],
    root: HTMLElement,
    options: TestOptions & { onTestComplete?: (result: TestResult) => void },
  ): Promise<TestResult[]> {
    this.currentCaseGroupNames = caseGroupNames;
    this.startTime = Date.now();
    this.lastEmitTime = this.startTime;
    if (this.isRunning) {
      throw new Error('Test is already running');
    }

    // 初始化进度相关状态
    this.completedTestCases = 0;
    this.currentEngineIndex = 0;
    this.currentSuiteIndex = 0;
    this.currentCaseIndex = 0;

    // 计算总测试用例数
    this.totalTestCases = 0;
    const suiteCounts = await this.getTestSuiteCaseCounts();
    this.totalTestCases =
      suiteCounts.reduce((sum, count) => sum + count, 0) * this.engines.length;
    console.log(
      'Total test cases calculated:',
      this.totalTestCases,
      'from',
      suiteCounts,
      'suites across',
      this.engines.length,
      'engines',
    );

    this.emitProgress();

    this.isRunning = true;
    this.stopRequested = false;
    this.results = [];

    this.emit(TestRunner.Events.START, this.engines);
    this.log(
      `🚀 Test Suite Start: Running with ${this.engines.length} engines`,
    );
    this.log('='.repeat(60));

    try {
      for (let i = 0; i < this.engines.length; i++) {
        if (this.stopRequested) break;

        this.currentEngineIndex = i;
        const engine = this.engines[i];
        if (!engine) continue;

        this.emit(TestRunner.Events.ENGINE_START, { engine, index: i });
        this.log(
          `🔧 Engine [${i + 1}/${this.engines.length}]: ${engine.name || 'unnamed'}`,
          1,
        );

        const container = document.createElement('div');
        container.style.cssText =
          'position: relative; width: 100%; height: 100%;';
        root.appendChild(container);

        try {
          await engine.initialize(container);

          for (let j = 0; j < caseGroupNames.length; j++) {
            if (this.stopRequested) break;

            this.currentSuiteIndex = j;
            const testSuiteName = caseGroupNames[j];
            if (!testSuiteName) continue;

            this.emit(TestRunner.Events.TEST_SUITE_START, {
              testSuiteName,
              engine,
            });
            this.log(`📦 Test Suite: ${testSuiteName}`, 2);

            // 重置当前测试套件的 case 索引
            this.currentCaseIndex = 0;

            const groupResults = await engine.testSuite(
              testSuiteName,
              options,
              {
                onTestComplete: (result) => {
                  this.emit(TestRunner.Events.TEST_COMPLETE, { result });
                  this.logTestResult(result);

                  // 更新进度
                  this.completedTestCases++;
                  this.emitProgress();

                  if (options.onTestComplete) {
                    options.onTestComplete(result);
                  }

                  // 更新当前测试套件中的 case 索引
                  this.currentCaseIndex++;
                },
              },
            );

            const passedCount = groupResults.filter((r) => r.success).length;
            const totalCount = groupResults.length;
            const status = passedCount === totalCount ? '✅' : '⚠️ ';
            this.log(
              `${status} ${testSuiteName}: ${passedCount}/${totalCount} tests passed`,
              2,
            );

            this.results.push(...groupResults);
            this.emit(TestRunner.Events.TEST_SUITE_COMPLETE, {
              testSuiteName,
              results: groupResults,
            });
            this.log(
              `TestSuite completed: ${testSuiteName} (${groupResults.length} tests, ${groupResults.filter((r) => r.success).length} passed)`,
            );
          }
        } catch (error) {
          const errorMessage = `❌ Error in engine ${engine?.name || 'unnamed'}: ${(error as Error).message}`;
          console.error(errorMessage, error);

          this.emit(TestRunner.Events.ERROR, {
            error: error as Error,
            context: { engine },
          });
          this.log(errorMessage, 2);
        } finally {
          if (engine) {
            try {
              await engine.destroy();
              const results = this.getResults();
              const passedCount = results.filter((r) => r.success).length;
              const totalCount = results.length;
              const status = passedCount === totalCount ? '✅' : '⚠️ ';

              this.emit(TestRunner.Events.ENGINE_COMPLETE, {
                engine,
                results: this.sortResults(results),
              });
              this.log(
                `${status} Engine completed: ${engine.name || 'unnamed'} (${passedCount}/${totalCount} tests passed)`,
                1,
              );
            } catch (e) {
              const error = e as Error;
              console.error(
                `Error destroying engine ${engine.name || 'unknown'}:`,
                error,
              );
              this.emit(TestRunner.Events.ERROR, {
                error,
                context: { engine, testSuiteName: undefined },
              });
              this.log(
                `Error in engine ${engine.name || 'unnamed'}: ${error.message}`,
              );
            }
          }

          root.removeChild(container);
        }
      }
    } catch (error) {
      this.emit(TestRunner.Events.ERROR, { error: error as Error });
      this.log(`Test suite error: ${(error as Error).message}`);
      throw error;
    } finally {
      this.isRunning = false;
      if (this.stopRequested) {
        const results = this.getResults();
        const passedCount = results.filter((r) => r.success).length;
        const totalCount = results.length;
        this.emit(TestRunner.Events.STOP, { results });
        this.log(
          `⏹️  Test suite stopped (${passedCount}/${totalCount} tests passed)`,
          0,
        );
        this.log('='.repeat(60));
      } else {
        const results = this.getResults();
        const passedCount = results.filter((r) => r.success).length;
        const totalCount = results.length;
        this.emit(TestRunner.Events.COMPLETE, { results });
        this.log('='.repeat(60));
        const status = passedCount === totalCount ? '✅' : '⚠️ ';
        this.log(
          `${status} Test completed: ${passedCount}/${totalCount} tests passed`,
          0,
        );
        this.log('='.repeat(60));
      }
    }

    return this.getResults();
  }

  stop() {
    if (this.isRunning) {
      this.stopRequested = true;
      this.emit(TestRunner.Events.STOPPING);
      this.log('Test suite is stopping...');
    }
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  isTestRunning(): boolean {
    return this.isRunning;
  }

  private log(message: string, indent = 0) {
    const now = new Date();
    // 使用本地时间格式，不指定特定区域
    const timestamp = now
      .toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/\//g, '-');
    const indentStr = '  '.repeat(indent);
    this.emit(TestRunner.Events.LOG, `[${timestamp}] ${indentStr}${message}`);
  }

  private logTestResult(result: TestResult) {
    if (!result.metrics) return;

    const status = result.success ? '✓' : '✗';
    const errorMsg = result.error ? ` - ${result.error}` : '';
    const { execute, cleanup } = result.metrics;

    // 执行阶段日志
    if (execute.memory) {
      const { beforeJSHeapSize, afterJSHeapSize, jsHeapSizeLimit } =
        execute.memory;
      const executeTime = execute.duration.toFixed(2);
      const usedMemory = (afterJSHeapSize - beforeJSHeapSize) / 1024 / 1024; // 转换为MB
      const totalMemory = (afterJSHeapSize / 1024 / 1024).toFixed(2);
      const limit = jsHeapSizeLimit
        ? (jsHeapSizeLimit / 1024 / 1024).toFixed(2)
        : 'N/A';
      const displayMemory = Math.max(0, usedMemory).toFixed(2);

      this.log(
        `${status} ${result.case} [Execute]: ${executeTime}ms, ` +
          `memory: +${displayMemory}MB (total: ${totalMemory}MB, limit: ${limit}MB)${errorMsg}`,
      );
    }

    // 清理阶段日志
    if (cleanup.memory) {
      const { beforeJSHeapSize, afterJSHeapSize } = cleanup.memory;
      const cleanupTime = cleanup.duration.toFixed(2);
      const cleanedMemory = (afterJSHeapSize - beforeJSHeapSize) / 1024 / 1024;
      const totalAfterCleanup = (afterJSHeapSize / 1024 / 1024).toFixed(2);

      let cleanupLog =
        `${status} ${result.case} [Cleanup]: ${cleanupTime}ms, ` +
        `memory: ${cleanedMemory >= 0 ? '+' : ''}${cleanedMemory.toFixed(2)}MB ` +
        `(total: ${totalAfterCleanup}MB)${errorMsg}`;

      // 检查内存泄漏
      if (execute.memory?.beforeJSHeapSize) {
        const initialMemory = execute.memory.beforeJSHeapSize;
        if (afterJSHeapSize > initialMemory * 1.1) {
          const leaked = (afterJSHeapSize - initialMemory) / 1024 / 1024;
          if (leaked > 1) {
            // 只显示大于1MB的内存泄漏
            cleanupLog += `\n  [WARNING] Possible memory leak: +${leaked.toFixed(2)}MB`;
          }
        }
      }

      this.log(cleanupLog);
    }
  }

  private sortResults(results: TestResult[]): TestResult[] {
    return [...results].sort((a, b) => {
      const durationA = a.metrics
        ? a.metrics.execute.duration + a.metrics.cleanup.duration
        : Infinity;
      const durationB = b.metrics
        ? b.metrics.execute.duration + b.metrics.cleanup.duration
        : Infinity;
      return durationA - durationB;
    });
  }
}

export default TestRunner;
