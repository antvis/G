import { type ZRenderType, Polygon } from 'zrender';
import { TestCase, type TestOptions } from '../../../../base';

export class PolygonCase extends TestCase<ZRenderType> {
  readonly name = 'polygon';
  private polygons: Polygon[] = [];

  protected async execute(
    app: ZRenderType,
    options: TestOptions,
  ): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const polygon = new Polygon({
        shape: {
          points: [
            [x + 50, y],
            [x + 100, y + 50],
            [x + 50, y + 100],
            [x, y + 50],
          ],
        },
        style: {
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      this.polygons.push(polygon);
      app.add(polygon);
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
    this.polygons.forEach((polygon) => app.remove(polygon));
    this.polygons = [];

    await super.cleanup(app);
  }
}
