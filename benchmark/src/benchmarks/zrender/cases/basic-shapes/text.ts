import { type ZRenderType, Text } from 'zrender';
import { TestCase, type TestOptions } from '../../../../base';

export class TextCase extends TestCase<ZRenderType> {
  name = 'text';
  private texts: Text[] = [];

  protected async execute(
    app: ZRenderType,
    options: TestOptions,
  ): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 150;
      const y = 30 + Math.floor(i / 10) * 40;
      const text = new Text({
        x,
        y,
        style: {
          text: `Text ${i + 1}`,
          fill: `hsl(${(i * 30) % 360}, 70%, 40%)`,
          fontSize: 16,
          fontWeight: 'bold',
        },
      });

      this.texts.push(text);
      app.add(text);
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
    this.texts.forEach((text) => {
      app.remove(text);
    });
    this.texts = [];

    await super.cleanup(app);
  }
}
