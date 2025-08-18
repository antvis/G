import { type Canvas, Shape } from '@antv/g-canvas-v4';
import { TestCase, type TestOptions } from '../../../../base';

export class TextCase extends TestCase<Canvas> {
  name = 'text';
  private texts: Shape.Text[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const text = new Shape.Text({
        type: 'text',
        attrs: {
          x,
          y,
          text: 'Text',
          fontSize: 32,
          fill: `hsl(${(i * 30) % 360}, 70%, 60%)`,
          stroke: '#333',
          lineWidth: 1,
        },
      });

      app.add(text);
      this.texts.push(text);
    }

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.texts.forEach((text) => text.remove());
    this.texts = [];

    await super.cleanup(app);
  }
}
