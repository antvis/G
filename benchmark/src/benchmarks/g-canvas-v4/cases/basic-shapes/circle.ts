import { type Canvas, Shape } from '@antv/g-canvas-v4';
import { TestCase, type TestOptions } from '../../../../base';

export class CircleCase extends TestCase<Canvas> {
  name = 'circle';
  private circles: Shape.Circle[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const circle = new Shape.Circle({
        type: 'circle',
        attrs: {
          cx: x,
          cy: y,
          r: 50,
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      app.add(circle);
      this.circles.push(circle);
    }

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.circles.forEach((circle) => circle.remove());
    this.circles = [];

    await super.cleanup(app);
  }
}
