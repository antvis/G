import { type Canvas, Shape } from '@antv/g-canvas-v4';
import { TestCase, type TestOptions } from '../../../../base';

export class PolylineCase extends TestCase<Canvas> {
  name = 'polyline';
  private polylines: Shape.Polyline[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const polyline = new Shape.Polyline({
        type: 'polyline',
        attrs: {
          points: [
            [x, y],
            [x + 20, y + 30],
            [x + 40, y + 10],
            [x + 60, y + 40],
            [x + 80, y + 20],
            [x + 100, y + 30],
          ],
          stroke: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          lineWidth: 4,
        },
      });

      app.add(polyline);
      this.polylines.push(polyline);
    }

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.polylines.forEach((polyline) => polyline.remove());
    this.polylines = [];

    await super.cleanup(app);
  }
}
