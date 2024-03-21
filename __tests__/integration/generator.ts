import { chromium, devices } from 'playwright';
import './utils/useSnapshotMatchers';
import { sleep } from './utils/sleep';

export function generateCanvasTestCase(
  renderer: 'canvas' | 'svg' | 'webgl',
  namespace: string,
  tests: Record<string, any>,
  params?: Partial<{
    width: number;
    height: number;
  }>,
) {
  const { width = 640, height = 640 } = params || {};

  Object.keys(tests).forEach((key) => {
    if (!tests[key].skip) {
      it(key, async () => {
        // Setup
        const browser = await chromium.launch({
          args: ['--headless', '--no-sandbox'],
        });
        const context = await browser.newContext(devices['Desktop Chrome']);
        const page = await context.newPage();

        await page.addInitScript(
          ({ renderer, width, height }) => {
            window['USE_PLAYWRIGHT'] = 1;
            window['DEFAULT_RENDERER'] = renderer;
            window['CANVAS_WIDTH'] = width;
            window['CANVAS_HEIGHT'] = height;
          },
          {
            renderer,
            width,
            height,
          },
        );

        // Go to test page served by vite devServer.
        const url = `http://localhost:${globalThis.PORT}/?name=${namespace}-${key}`;
        await page.goto(url);

        await sleep(300);

        // Chart already rendered, capture into buffer.
        const buffer = await page
          .locator(renderer === 'svg' ? 'svg' : 'canvas')
          .screenshot();

        const dir = `${__dirname}/snapshots/${namespace}/${renderer}`;
        try {
          const maxError = 0;
          expect(buffer).toMatchCanvasSnapshot(dir, key, { maxError });
        } finally {
          await context.close();
          await browser.close();
        }
      });
    }
  });
}
