import { useEffect, useRef, useState } from 'preact/hooks';
import { useTranslation } from 'preact-i18next';
import { testRunner } from '../benchmarks';
import type { TestResult } from '../base/types';
import type { TestRunnerEvents } from '../base/TestRunner';

export function Logs() {
  const { t } = useTranslation();
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<TestRunnerEvents<unknown>['progress'][0] | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // 监听日志和结果事件
  useEffect(() => {
    const handleLog = (message: string) => {
      setLogs((prev) => [...prev, message]);
    };

    const handleTestComplete = (event: { result: TestResult }) => {
      setResults((prev) => [...prev, event.result]);
    };

    const handleComplete = (event: { results: TestResult[] }) => {
      setResults(event.results);
    };

    testRunner.on('log', handleLog);
    const handleProgress = (event: TestRunnerEvents<unknown>['progress'][0]) => {
      setProgress(event);
    };

    testRunner.on('testComplete', handleTestComplete);
    testRunner.on('complete', handleComplete);
    testRunner.on('stop', handleComplete);
    testRunner.on('progress', handleProgress);

    // 组件卸载时移除事件监听
    return () => {
      testRunner.off('log', handleLog);
      testRunner.off('testComplete', handleTestComplete);
      testRunner.off('complete', handleComplete);
      testRunner.off('stop', handleComplete);
      testRunner.off('progress', handleProgress);
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    const logContainer = logEndRef.current?.parentElement?.parentElement;
    if (logContainer) {
      // 直接滚动到容器的最底部
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [logs]);

  // 处理导出结果
  const handleExport = () => {
    const data = JSON.stringify(results, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmark-results-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导出日志
  const handleExportLogs = () => {
    const logText = logs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmark-logs-${new Date().toISOString()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  
  return (
    <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 py-3 px-4">
        <h2 class="text-base font-semibold text-gray-800">{t('logs.title')}</h2>
      </div>
      <div class="p-4">
        <div class="flex justify-between items-center mb-4">
          <div class="text-sm text-gray-500">
            {t('logs.totalResults', { count: results.length })}
          </div>
          <div class="space-x-2">
            <button
              class={`px-2 py-1 text-xs rounded text-white ${results.length > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}`}
              onClick={handleExport}
              disabled={results.length === 0}
            >
              {t('logs.exportResults')}
            </button>
            <button
              class={`px-2 py-1 text-xs rounded text-white ${logs.length > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}`}
              onClick={handleExportLogs}
              disabled={logs.length === 0}
            >
              {t('logs.exportLogs')}
            </button>
          </div>
        </div>

        {progress && (
          <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>{t('logs.progress.overall')}: {progress.progress}%</span>
              <span>
                {t('logs.progress.elapsedRemaining')}: {progress.time.elapsed.toFixed(1)}s / {progress.time.remaining.toFixed(1)}s
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                class="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-700">
              <div class="bg-white p-2 rounded border">
                <div class="font-medium">{t('logs.progress.engineProgress')}</div>
                <div>{progress.engine.current}/{progress.engine.total} - {progress.engine.name}</div>
                <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div 
                    class="bg-blue-400 h-1.5 rounded-full"
                    style={{ width: `${(progress.engine.current / progress.engine.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div class="bg-white p-2 rounded border">
                <div class="font-medium">{t('logs.progress.testSuite')}</div>
                <div>{progress.suite.current}/{progress.suite.total} - {progress.suite.name}</div>
                <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div 
                    class="bg-green-400 h-1.5 rounded-full"
                    style={{ width: progress.suite.total > 0 ? `${(progress.suite.current / progress.suite.total) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div class="bg-white p-2 rounded border">
                <div class="font-medium">{t('logs.progress.testCase')}</div>
                <div>{progress.testCase.current}/{progress.testCase.total} - {progress.testCase.name}</div>
                <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div 
                    class="bg-yellow-400 h-1.5 rounded-full"
                    style={{ width: progress.testCase.total > 0 ? `${(progress.testCase.current / progress.testCase.total) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="text-xs text-gray-500 mt-2">
              {t('logs.progress.current')}: {progress.engine.name} &gt; {progress.suite.name} &gt; {progress.testCase.name}
            </div>
          </div>
        )}
        <div class="bg-gray-50 rounded p-3 h-64 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div class="text-gray-500 italic">
              {t('logs.noLogsMessage')}
            </div>
          ) : (
            <div class="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  class="py-1 px-2 bg-white rounded border border-gray-200"
                >
                  <span class="text-gray-400 mr-2">•</span>
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
