import { type Canvas, Polyline, CanvasEvent } from '@antv/g-local';
import { TestCase, type TestOptions } from '../../../../base';

export class PolylineCase extends TestCase<Canvas> {
  name = 'polyline';
  private polylines: Polyline[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const polyline = new Polyline({
        style: {
          points: [
            [x, y],
            [x + 25, y + 50],
            [x + 50, y],
            [x + 75, y + 50],
            [x + 100, y],
          ],
          stroke: `hsl(${(i * 30) % 360}, 70%, 50%)`,
          lineWidth: 2,
        },
      });

      app.appendChild(polyline);
      this.polylines.push(polyline);
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
    this.polylines.forEach((polyline) => polyline.remove());
    this.polylines = [];

    await super.cleanup(app);
  }
}
