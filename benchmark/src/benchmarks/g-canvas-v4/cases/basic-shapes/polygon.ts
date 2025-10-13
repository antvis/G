import { type Canvas, Shape } from '@antv/g-canvas-v4';
import { TestCase, type TestOptions } from '../../../../base';

export class PolygonCase extends TestCase<Canvas> {
  name = 'polygon';
  private polygons: Shape.Polygon[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const polygon = new Shape.Polygon({
        type: 'polygon',
        attrs: {
          points: [
            [x, y],
            [x + 50, y],
            [x + 60, y + 30],
            [x + 30, y + 60],
            [x, y + 30],
          ],
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      app.add(polygon);
      this.polygons.push(polygon);
    }

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.polygons.forEach((polygon) => polygon.remove());
    this.polygons = [];

    await super.cleanup(app);
  }
}
