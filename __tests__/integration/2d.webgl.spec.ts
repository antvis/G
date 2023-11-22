import { chromium, devices } from 'playwright';
import * as basic2d from '../demos/2d';
import './utils/useSnapshotMatchers';
import { sleep } from './utils/sleep';

const namespace = '2d';
describe('WebGL Snapshot', () => {
  Object.keys(basic2d).forEach((key) => {
    it(key, async () => {
      // Setup
      const browser = await chromium.launch({
        args: ['--headless', '--no-sandbox'],
      });
      const context = await browser.newContext(devices['Desktop Chrome']);
      const page = await context.newPage();

      await page.addInitScript(() => {
        window['USE_PLAYWRIGHT'] = 1;
        window['DEFAULT_RENDERER'] = 'webgl';
      });

      // Go to test page served by vite devServer.
      const url = `http://localhost:${globalThis.PORT}/?name=${namespace}-${key}`;
      await page.goto(url);

      await sleep(300);

      // Chart already rendered, capture into buffer.
      const buffer = await page.locator('canvas').screenshot();

      const dir = `${__dirname}/snapshots/${namespace}/webgl`;
      try {
        const maxError = 0;
        await expect(buffer).toMatchCanvasSnapshot(dir, key, { maxError });
      } finally {
        await context.close();
        await browser.close();
      }
    });
  });
});
