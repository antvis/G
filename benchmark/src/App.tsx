import { useTranslation } from 'preact-i18next';
import { ControlPanel } from './components/ControlPanel';
import { SceneViewer } from './components/SceneViewer';
import { Logs } from './components/Logs';
import { PerformanceChart } from './components/PerformanceChart';
import './i18n/i18n';

export function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {t('header.title')}
            </h1>
            <p className="text-gray-600">{t('header.subtitle')}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 text-sm rounded ${
                i18n.language === 'en'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('zh')}
              className={`px-3 py-1 text-sm rounded ${
                i18n.language === 'zh'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-8">
          <ControlPanel />
          <SceneViewer />
          <Logs />
          <PerformanceChart />
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-500">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
