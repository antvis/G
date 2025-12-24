import { type ZRenderType, Rect } from 'zrender';
import { TestCase, type TestOptions } from '../../../../base';

export class RectCase extends TestCase<ZRenderType> {
  readonly name = 'rect';
  private rects: Rect[] = [];

  protected async execute(
    app: ZRenderType,
    options: TestOptions,
  ): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const rect = new Rect({
        shape: { x, y, width: 100, height: 100 },
        style: {
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });
      this.rects.push(rect);
      app.add(rect);
    }

    return new Promise((resolve) => {
      app.on('rendered', () => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }

  protected async cleanup(app: ZRenderType): Promise<void> {
    this.rects.forEach((rect) => app.remove(rect));
    this.rects = [];

    await super.cleanup(app);
  }
}
