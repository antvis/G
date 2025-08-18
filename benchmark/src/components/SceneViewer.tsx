import { useTranslation } from 'preact-i18next';

export function SceneViewer() {
  const { t } = useTranslation();
  
  return (
    <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200 py-3 px-4">
        <h2 class="text-base font-semibold text-gray-800">
          {t('sceneViewer.title', 'Render Preview')}
        </h2>
      </div>
      <div class="p-4">
        <div
          id="container"
          style="width: 100%; height: 400px; background: #fafafa;"
        />
      </div>
    </div>
  );
}
