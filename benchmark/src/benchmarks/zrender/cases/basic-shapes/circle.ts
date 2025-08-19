import { type ZRenderType, Circle } from 'zrender';
import { TestCase, type TestOptions } from '../../../../base';

export class CircleCase extends TestCase<ZRenderType> {
  readonly name = 'circle';
  private circles: Circle[] = [];

  protected async execute(
    app: ZRenderType,
    options: TestOptions,
  ): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const circle = new Circle({
        shape: { cx: x, cy: y, r: 50 },
        style: {
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      this.circles.push(circle);
      app.add(circle);
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
    this.circles.forEach((circle) => app.remove(circle));
    this.circles = [];

    await super.cleanup(app);
  }
}
