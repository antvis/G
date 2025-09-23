import { type Canvas, Ellipse, CanvasEvent } from '@antv/g-local';
import { TestCase, type TestOptions } from '../../../../base';

export class EllipseCase extends TestCase<Canvas> {
  name = 'ellipse';
  private ellipses: Ellipse[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const ellipse = new Ellipse({
        style: {
          cx: x,
          cy: y,
          rx: 50,
          ry: 30,
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      app.appendChild(ellipse);
      this.ellipses.push(ellipse);
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
    this.ellipses.forEach((ellipse) => ellipse.remove());
    this.ellipses = [];

    await super.cleanup(app);
  }
}
