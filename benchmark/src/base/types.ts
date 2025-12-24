import type { TestCase } from './TestCase';

declare global {
  interface Performance {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
  }
}

export interface MemoryMetrics {
  /** 测试前内存使用量(字节) */
  beforeJSHeapSize: number;

  /** 测试后内存使用量(字节) */
  afterJSHeapSize: number;

  /** 堆大小限制 */
  jsHeapSizeLimit?: number;
}

export interface PhaseMetrics {
  /** 阶段耗时（毫秒） */
  duration: number;

  /** 内存使用情况 */
  memory?: MemoryMetrics;

  /** 帧率（如果适用） */
  fps?: number;
}

export interface TestMetrics {
  /** 测试执行阶段指标 */
  execute: PhaseMetrics;

  /** 清理阶段指标 */
  cleanup: PhaseMetrics;
}

export interface TestResult {
  engine: string;
  testSuite: string;
  case: string;
  success: boolean;
  error?: string;
  metrics?: TestMetrics;
}

export interface TestOptions {
  iterations: number;
  warmup?: number;
  continueOnError: boolean;
  elementCount: number;
  engineName?: string;
}

export interface TestSuite<T> {
  name: string;
  cases: TestCase<T>[];
}
