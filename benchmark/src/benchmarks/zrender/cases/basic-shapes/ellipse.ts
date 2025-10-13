import { type ZRenderType, Ellipse } from 'zrender';
import { TestCase, type TestOptions } from '../../../../base';

export class EllipseCase extends TestCase<ZRenderType> {
  readonly name = 'ellipse';
  private ellipses: Ellipse[] = [];

  protected async execute(
    app: ZRenderType,
    options: TestOptions,
  ): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const ellipse = new Ellipse({
        shape: { cx: x, cy: y, rx: 50, ry: 30 },
        style: {
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      this.ellipses.push(ellipse);
      app.add(ellipse);
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
    this.ellipses.forEach((ellipse) => app.remove(ellipse));
    this.ellipses = [];

    await super.cleanup(app);
  }
}
