import { type ZRenderType, Polyline } from 'zrender';
import { TestCase, type TestOptions } from '../../../../base';

export class PolylineCase extends TestCase<ZRenderType> {
  readonly name = 'polyline';
  private polylines: Polyline[] = [];

  protected async execute(
    app: ZRenderType,
    options: TestOptions,
  ): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const polyline = new Polyline({
        shape: {
          points: [
            [x, y],
            [x + 25, y + 50],
            [x + 50, y],
            [x + 75, y + 50],
            [x + 100, y],
          ],
        },
        style: {
          stroke: `hsl(${(i * 30) % 360}, 70%, 50%)`,
          lineWidth: 2,
        },
      });

      this.polylines.push(polyline);
      app.add(polyline);
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
    this.polylines.forEach((polyline) => app.remove(polyline));
    this.polylines = [];

    await super.cleanup(app);
  }
}
