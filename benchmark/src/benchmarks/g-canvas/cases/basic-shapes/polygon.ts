import { type Canvas, Polygon, CanvasEvent } from '@antv/g';
import { TestCase, type TestOptions } from '../../../../base';

export class PolygonCase extends TestCase<Canvas> {
  name = 'polygon';
  private polygons: Polygon[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const polygon = new Polygon({
        style: {
          points: [
            [x + 50, y],
            [x + 100, y + 50],
            [x + 50, y + 100],
            [x, y + 50],
          ],
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      app.appendChild(polygon);
      this.polygons.push(polygon);
    }

    return new Promise((resolve) => {
      app.addEventListener(CanvasEvent.RERENDER, () => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.polygons.forEach((polygon) => polygon.remove());
    this.polygons = [];

    await super.cleanup(app);
  }
}
