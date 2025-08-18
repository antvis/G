import { useEffect, useRef, useState } from 'preact/hooks';
import { Chart } from '@antv/g2';
import { useTranslation } from 'preact-i18next';
import { testRunner } from '../benchmarks';
import type { TestResult } from '../base/types';

// Simple template formatter that replaces {{key}} with values from data object
const formatTemplate = (template: string, data: Record<string, any>): string => {
  return Object.entries(data).reduce(
    (str, [key, value]) => 
      str.replace(new RegExp(`\\{\\s*${key}\\s*\\}`, 'g'), String(value)),
    template
  );
};

export function PerformanceChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [testSuites, setTestSuites] = useState<string[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<string>('');
  const lastResultsRef = useRef<TestResult[]>([]);
  const [insight, setInsight] = useState<string>(''); // 添加洞察状态
  const [isInsightExpanded, setIsInsightExpanded] = useState<boolean>(true); // 控制洞察区域是否展开
  const { t } = useTranslation();

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    initializeChart();

    // 处理测试完成事件 - 增量更新
    const handleTestComplete = (event: { result: TestResult }) => {
      lastResultsRef.current = [...lastResultsRef.current, event.result];
      updateChart(lastResultsRef.current, false); // 增量更新
    };

    // 处理全部测试完成事件 - 全量更新
    const handleComplete = (event: { results: TestResult[] }) => {
      lastResultsRef.current = event.results;
      updateChart(event.results, true); // 全量更新
    };

    // 处理停止事件 - 全量更新
    const handleStop = (event: { results: TestResult[] }) => {
      lastResultsRef.current = event.results;
      updateChart(event.results, true); // 全量更新
    };

    testRunner.on('testComplete', handleTestComplete);
    testRunner.on('complete', handleComplete);
    testRunner.on('stop', handleStop);

    return () => {
      testRunner.off('testComplete', handleTestComplete);
      testRunner.off('complete', handleComplete);
      testRunner.off('stop', handleStop);

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  // 初始化图表
  const initializeChart = () => {
    if (!chartRef.current) return;

    // 销毁现有图表实例
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // 创建新的图表实例
    const chart = new Chart({
      container: chartRef.current,
      autoFit: true,
      height: 500,
    });

    chartInstanceRef.current = chart;

    // 设置图表基础配置
    chart
      .interval()
      .data([])
      .encode('x', 'testCase')
      .encode('y', 'duration')
      .encode('color', 'phase')
      .transform({ type: 'dodgeX' })
      .axis('x', { title: t('performanceChart.testCase') })
      .axis('y', { title: t('performanceChart.durationMs') })
      .legend('color', { title: t('performanceChart.phase') })
      .interaction('elementHighlight', { background: true })
      .interaction('tooltip', {
        shared: true,
      });

    chart.render();
  };

  // 为引擎生成基准色
  const getEngineColor = (engine: string, engines: string[]): string => {
    const index = engines.indexOf(engine);
    const hue = ((index * 360) / engines.length) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // 生成洞察文本
  const generateInsight = (results: TestResult[], suite: string, t: any): string => {
    if (!suite || results.length === 0) {
      return '';
    }

    // 筛选出当前套件的数据
    const suiteResults = results.filter((r) => r.testSuite === suite);
    if (suiteResults.length === 0) {
      return '';
    }

    // 计算统计数据
    const totalTests = suiteResults.length;
    const failedTests = suiteResults.filter((r) => !r.success).length;
    const successRate = (
      ((totalTests - failedTests) / totalTests) *
      100
    ).toFixed(1);

    // 按引擎分组
    const resultsByEngine: Record<string, TestResult[]> = {};
    suiteResults.forEach((result) => {
      if (!resultsByEngine[result.engine]) {
        resultsByEngine[result.engine] = [];
      }
      resultsByEngine[result.engine]?.push(result);
    });

    // 按测试用例分组
    const resultsByCase: Record<string, TestResult[]> = {};
    suiteResults.forEach((result) => {
      const caseName = result.case;
      if (!resultsByCase[caseName]) {
        resultsByCase[caseName] = [];
      }
      resultsByCase[caseName]?.push(result);
    });

    // 计算每个引擎的统计信息
    const engineStats: Record<
      string,
      {
        avgExecute: number;
        avgCleanup: number;
        failureRate: number;
        totalTests: number;
        failedTests: number;
      }
    > = {};
    Object.entries(resultsByEngine).forEach(([engine, engineResults]) => {
      const validResults = engineResults.filter((r) => r.success && r.metrics);
      const totalEngineTests = engineResults.length;
      const failedEngineTests = engineResults.filter((r) => !r.success).length;

      const totalExecute = validResults.reduce(
        (sum, r) => sum + r.metrics!.execute.duration,
        0,
      );
      const totalCleanup = validResults.reduce(
        (sum, r) => sum + r.metrics!.cleanup.duration,
        0,
      );

      engineStats[engine] = {
        avgExecute:
          validResults.length > 0 ? totalExecute / validResults.length : 0,
        avgCleanup:
          validResults.length > 0 ? totalCleanup / validResults.length : 0,
        failureRate:
          totalEngineTests > 0
            ? (failedEngineTests / totalEngineTests) * 100
            : 0,
        totalTests: totalEngineTests,
        failedTests: failedEngineTests,
      };
    });

    // 基于同测试用例对比的性能分析
    let performanceDetails = '';

    if (Object.keys(engineStats).length > 1) {
      // 分析每个测试用例中引擎间的性能差异
      const casePerformanceAnalysis: Array<{
        caseName: string;
        fastestEngine: string;
        slowestEngine: string;
        performanceRatio: number;
      }> = [];

      // 对每个测试用例分析引擎性能差异
      Object.entries(resultsByCase).forEach(([caseName, caseResults]) => {
        // 只考虑成功的测试
        const validResults = caseResults.filter((r) => r.success && r.metrics);

        if (validResults.length > 1) {
          // 至少有两个引擎完成了这个测试用例
          // 按执行时间排序
          const sortedResults = validResults.sort(
            (a, b) => a.metrics!.execute.duration - b.metrics!.execute.duration,
          );

          const fastest = sortedResults[0]!;
          const slowest = sortedResults[sortedResults.length - 1]!;
          const ratio =
            slowest.metrics!.execute.duration /
            fastest.metrics!.execute.duration;

          casePerformanceAnalysis.push({
            caseName,
            fastestEngine: fastest.engine,
            slowestEngine: slowest.engine,
            performanceRatio: ratio,
          });
        }
      });

      // 根据性能差异倍数分类测试用例
      const largeGapCases = casePerformanceAnalysis
        .filter((item) => item.performanceRatio >= 2.0)
        .sort((a, b) => b.performanceRatio - a.performanceRatio); // 按倍数降序排序

      const mediumGapCases = casePerformanceAnalysis
        .filter(
          (item) => item.performanceRatio >= 1.5 && item.performanceRatio < 2.0,
        )
        .sort((a, b) => b.performanceRatio - a.performanceRatio); // 按倍数降序排序

      const smallGapCases = casePerformanceAnalysis.filter(
        (item) => item.performanceRatio < 1.5,
      );

      // 构建格式化的性能分析详情
      if (casePerformanceAnalysis.length > 0) {
        performanceDetails += `\n\n${t('performanceInsight.performanceAnalysis')}\n`;
        performanceDetails += `${t('performanceInsight.analyzedCount', { count: casePerformanceAnalysis.length })}\n\n`;

        if (largeGapCases.length > 0) {
          performanceDetails += `${t('performanceInsight.performanceGap.high')}\n`;
          largeGapCases.forEach((item) => {
            performanceDetails += `  - "${item.caseName}": ${item.fastestEngine} ${t('performanceInsight.fasterThan')} ${item.slowestEngine} ${t('performanceInsight.timesFaster', { ratio: item.performanceRatio.toFixed(1) })}\n`;
          });
          performanceDetails += '\n';
        }

        if (mediumGapCases.length > 0) {
          performanceDetails += `${t('performanceInsight.performanceGap.medium')}\n`;
          mediumGapCases.forEach((item) => {
            performanceDetails += `  - "${item.caseName}": ${item.fastestEngine} ${t('performanceInsight.fasterThan')} ${item.slowestEngine} ${t('performanceInsight.timesFaster', { ratio: item.performanceRatio.toFixed(1) })}\n`;
          });
          performanceDetails += '\n';
        }

        if (smallGapCases.length > 0) {
          performanceDetails += `${t('performanceInsight.performanceGap.low', { count: smallGapCases.length })}\n`;
        }
      }
    }

    // 构建洞察文本
    let insightText = formatTemplate(t('performanceInsight.testSummary'), {
      suiteName: suite,
      totalTests,
      successCount: totalTests - failedTests,
      successRate,
      failedTests
    });

    if (failedTests > 0) {
      insightText += ' ' + formatTemplate(t('performanceInsight.failureWarning'), {
        count: failedTests
      });
    }

    // 添加失败率信息
    const highestFailureRateEngine = Object.entries(engineStats)
      .filter(([, stats]) => stats!.failureRate > 0)
      .sort(([, a], [, b]) => b!.failureRate - a!.failureRate)[0];

    if (highestFailureRateEngine) {
      const [engine, stats] = highestFailureRateEngine;
      insightText += ` ${engine} 引擎的失败率最高，达到 ${stats!.failureRate.toFixed(1)}% (${stats!.failedTests}/${stats!.totalTests})。`;
    }

    // 添加格式化的性能分析详情
    if (performanceDetails) {
      insightText += performanceDetails;
    }

    return insightText;
  };

  // 更新图表数据
  const updateChart = (results: TestResult[], isFullUpdate: boolean = true) => {
    if (!chartRef.current) return;

    // 提取所有testSuite名称
    const suites = Array.from(new Set(results.map((r) => r.testSuite)));
    setTestSuites(suites);

    // 如果没有选中的suite，选择第一个
    let targetSuite = selectedSuite;
    if (
      (!selectedSuite || !suites.includes(selectedSuite)) &&
      suites.length > 0
    ) {
      targetSuite = suites[0] || '';
      setSelectedSuite(targetSuite);
    }

    // 确保使用最新的targetSuite来生成洞察
    const finalSuite = targetSuite || (suites.length > 0 ? suites[0] : '');

    // 生成洞察
    const newInsight = generateInsight(results, finalSuite || '', t);
    setInsight(newInsight);

    // 筛选出当前选中的测试套件数据
    const filteredResults = results.filter(
      (result) => result.testSuite === finalSuite,
    );

    // 如果filteredResults为空，处理空数据情况
    if (filteredResults.length === 0) {
      if (isFullUpdate || !chartInstanceRef.current) {
        // 全量更新且数据为空时重新初始化图表
        initializeChart();
      }
      return;
    }

    // 获取所有唯一的引擎
    const uniqueEngines = Array.from(
      new Set(filteredResults.map((r) => r.engine)),
    );

    // 为每个引擎生成基准色
    const engineColors: Record<string, string> = {};
    uniqueEngines.forEach((engine) => {
      engineColors[engine] = getEngineColor(engine, uniqueEngines);
    });

    // 组织数据，按要求格式
    // 先组织所有执行阶段的数据
    const executeData = filteredResults.map((result) => {
      // 检查success字段，如果为false则将duration设为负值
      let executeDuration;
      if (result.success && result.metrics) {
        executeDuration = Number(result.metrics.execute.duration.toFixed(2));
      } else {
        // 如果success为false，使用默认值-1或其他负值
        executeDuration = -1;
      }

      return {
        testCase: result.case,
        engine: result.engine,
        phase: `${result.engine} - Execute`,
        duration: executeDuration,
        color: engineColors[result.engine],
      };
    });

    // 再组织所有清理阶段的数据
    const cleanupData = filteredResults.map((result) => {
      // 检查success字段，如果为false则将duration设为负值
      let cleanupDuration;
      if (result.success && result.metrics) {
        cleanupDuration = Number(result.metrics.cleanup.duration.toFixed(2));
      } else {
        // 如果success为false，使用默认值-1或其他负值
        cleanupDuration = -1;
      }

      return {
        testCase: result.case,
        engine: result.engine,
        phase: `${result.engine} - Cleanup`,
        duration: cleanupDuration,
        color: engineColors[result.engine]!.replace('hsl(', 'hsla(').replace(
          ')',
          ', 0.05)',
        ),
      };
    });

    // 合并数据，确保执行阶段在前，清理阶段在后
    const chartData = [...executeData, ...cleanupData];

    // 获取唯一的phase值，按出现顺序排列
    const uniquePhasesInOrder = Array.from(
      new Set(chartData.map((item) => item.phase)),
    );

    // 获取颜色映射
    const colorMap: Record<string, string> = {};
    chartData.forEach((item) => {
      colorMap[item.phase] = item.color!;
    });

    // 如果是全量更新或者图表实例不存在，则重新创建图表
    if (isFullUpdate || !chartInstanceRef.current) {
      // 销毁现有图表实例
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // 创建新的图表实例
      const chart = new Chart({
        container: chartRef.current,
        autoFit: true,
        height: 500,
      });

      chartInstanceRef.current = chart;

      // 设置图表配置和数据
      chart
        .interval()
        .data(chartData)
        .encode('x', 'testCase')
        .encode('y', 'duration')
        .encode('color', 'phase')
        .transform({ type: 'dodgeX' })
        .axis('x', { title: t('performanceChart.testCase') })
        .axis('y', { title: t('performanceChart.durationMs') })
        .legend('color', { title: t('performanceChart.phase') })
        .interaction('elementHighlight', { background: true })
        .interaction('tooltip', {
          shared: true,
        })
        .scale('color', {
          domain: uniquePhasesInOrder,
          range: uniquePhasesInOrder.map((phase) => colorMap[phase]),
        });

      // 渲染图表
      chart.render();
    } else {
      // 增量更新，使用changeData方法
      if (chartInstanceRef.current) {
        // 手动更新颜色映射以确保图例和tooltip顺序正确
        chartInstanceRef.current.scale('color', {
          domain: uniquePhasesInOrder,
          range: uniquePhasesInOrder.map((phase) => colorMap[phase]),
        });

        // 更新数据
        chartInstanceRef.current.changeData(chartData);
        chartInstanceRef.current.render();
      }
    }
  };

  const handleSuiteChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setSelectedSuite(target.value);

    // 当用户切换suite时，使用最新的结果重新渲染图表
    if (lastResultsRef.current.length > 0) {
      updateChart(lastResultsRef.current);
    }
  };

  // 处理文件上传
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          // 验证数据格式
          if (Array.isArray(jsonData)) {
            lastResultsRef.current = jsonData;
            updateChart(jsonData);
          } else {
            alert(t('performanceChart.invalidJson'));
          }
        } catch (error) {
          alert(t('performanceChart.parseError') + (error as Error).message);
        }
      };
      reader.readAsText(file);
    }

    // 清空文件输入，以便可以选择相同的文件
    if (target) {
      target.value = '';
    }
  };

  return (
    <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 py-3 px-4">
        <h2 class="text-base font-semibold text-gray-800">{t('performanceChart.title')}</h2>
      </div>
      <div class="p-4">
        <div class="flex flex-wrap gap-3 mb-3">
          {testSuites.length > 0 && (
            <div class="flex items-center gap-2">
              <label htmlFor="suite-select" class="text-gray-700 text-sm">
                {t('performanceChart.selectSuite')}
              </label>
              <select
                id="suite-select"
                value={selectedSuite}
                onChange={handleSuiteChange}
                class="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {testSuites.map((suite) => (
                  <option key={suite} value={suite}>
                    {suite}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div class="ml-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: 'none' }}
            />
            <button
              class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleFileUpload}
            >
              {t('performanceChart.uploadResults')}
            </button>
          </div>
        </div>
        <div>
          {insight && (
            <div class="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <div 
                class="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors duration-150"
                onClick={() => setIsInsightExpanded(!isInsightExpanded)}
              >
                <h3 class="text-sm font-medium text-blue-800">{t('performanceChart.insightsTitle')}</h3>
                <div class="flex items-center">
                  <span class="text-xs text-blue-600 mr-2">
                    {isInsightExpanded ? t('performanceChart.collapse') : t('performanceChart.expand')}
                  </span>
                <svg 
                  class={`w-4 h-4 text-gray-500 transform transition-transform ${isInsightExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                </div>
              </div>
              {isInsightExpanded && (
                <div class="p-4 bg-blue-50">
                  <div class="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">{insight}</div>
                </div>
              )}
            </div>
          )}
        </div>
        <div ref={chartRef}></div>
      </div>
    </div>
  );
}
