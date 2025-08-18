import { useState, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import { useTranslation } from 'preact-i18next';
import { testRunner } from '../benchmarks';

export function ControlPanel() {
  const { t } = useTranslation();
  const [elementCount, setElementCount] = useState(10000);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [iterations, setIterations] = useState(1);
  const [continueOnError, setContinueOnError] = useState(false);

  // 初始化可用测试组和状态监听
  useEffect(() => {
    // 从 testRunner 获取测试组名称
    const groups = testRunner.getTestCaseGroupNames();
    setAvailableGroups(groups);
    setSelectedGroups([...groups]);

    // 监听测试运行状态变化
    const handleStart = () => setIsRunning(true);
    const handleStop = () => setIsRunning(false);
    const handleComplete = () => setIsRunning(false);
    const handleError = () => setIsRunning(false);

    testRunner.on('start', handleStart);
    testRunner.on('stop', handleStop);
    testRunner.on('complete', handleComplete);
    testRunner.on('error', handleError);

    return () => {
      testRunner.off('start', handleStart);
      testRunner.off('stop', handleStop);
      testRunner.off('complete', handleComplete);
      testRunner.off('error', handleError);
    };
  }, []);

  const handleElementCountChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(value)) {
      setElementCount(Math.max(1, value));
    }
  };

  const handleTestTypeChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    const selectedValue = select.value;
    setSelectedGroups(selectedValue ? [selectedValue] : []);
  };

  const handleStartTest = () => {
    if (selectedGroups.length === 0 || isRunning) return;

    // 运行测试
    testRunner
      .runTests(selectedGroups, document.getElementById('container')!, {
        elementCount,
        iterations,
        continueOnError,
      })
      .catch((error) => {
        console.error('Test run failed:', error);
      });
  };

  const handleStopTest = () => {
    if (isRunning) {
      testRunner.stop();
    }
  };

  const handleResetTest = () => {
    // 重置测试状态
    setElementCount(10000);
    setSelectedGroups([...availableGroups]);
    setIterations(1);
    setContinueOnError(false);
  };

  return (
    <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 py-3 px-4">
        <h2 class="text-base font-semibold text-gray-800">{t('controlPanel.title')}</h2>
      </div>
      <div class="p-4">
        <div class="mb-4">
          <div class="mb-3">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">{t('controlPanel.testGroup')}</span>
              <span class="text-xs text-gray-500">
                {selectedGroups.length}/{availableGroups.length} {t('controlPanel.selected')}
              </span>
            </div>
            <select
              class="w-full p-2 rounded border border-gray-300 mb-2 text-sm"
              value={selectedGroups[0] || ''}
              onChange={handleTestTypeChange}
              disabled={isRunning}
            >
              <option value="">{t('controlPanel.selectGroup')}</option>
              {availableGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <div class="text-xs text-gray-600 mb-1">
              {t('controlPanel.selected')}:{' '}
              {selectedGroups.length > 0 ? selectedGroups[0] || t('controlPanel.noneSelected') : t('controlPanel.noneSelected')}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div class="flex flex-col">
            <label class="text-xs font-medium text-gray-700 mb-1">
              {t('controlPanel.elementCount')}
            </label>
            <input
              type="number"
              min="1"
              max="100000"
              value={elementCount}
              onInput={handleElementCountChange}
              disabled={isRunning}
              class="px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div class="flex flex-col">
            <label class="text-xs font-medium text-gray-700 mb-1">
              {t('controlPanel.iterations')}
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={iterations}
              onInput={(e) => {
                const value = parseInt(
                  (e.target as HTMLInputElement).value,
                  10,
                );
                if (!isNaN(value)) {
                  setIterations(Math.max(1, value));
                }
              }}
              disabled={isRunning}
              class="px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div class="flex flex-col">
            <label class="text-xs font-medium text-gray-700 mb-1">
              {t('controlPanel.otherOptions')}
            </label>
            <div class="flex items-start pt-1">
              <input
                type="checkbox"
                id="continueOnError"
                checked={continueOnError}
                onChange={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  setContinueOnError((e.target as HTMLInputElement).checked)
                }
                disabled={isRunning}
                class="rounded text-blue-600 mr-2 mt-0.5"
              />
              <label for="continueOnError" class="text-xs text-gray-700">
                {t('controlPanel.continueOnError')}
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button
            class="px-3 py-1 rounded font-medium bg-green-500 text-white hover:bg-green-600 text-sm disabled:bg-green-300 disabled:cursor-not-allowed"
            onClick={handleStartTest}
            disabled={isRunning || selectedGroups.length === 0}
          >
            {t('controlPanel.startTest')}
          </button>
          <button
            class="px-3 py-1 rounded font-medium bg-red-500 text-white hover:bg-red-600 text-sm disabled:bg-red-300 disabled:cursor-not-allowed"
            onClick={handleStopTest}
            disabled={!isRunning}
          >
            {t('controlPanel.stopTest')}
          </button>
          <button
            class="px-3 py-1 rounded font-medium bg-gray-500 text-white hover:bg-gray-600 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleResetTest}
            disabled={isRunning}
          >
            {t('controlPanel.reset')}
          </button>
        </div>
      </div>
    </div>
  );
}
