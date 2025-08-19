import { type Canvas, Text, CanvasEvent } from '@antv/g';
import { TestCase, type TestOptions } from '../../../../base';

export class TextCase extends TestCase<Canvas> {
  name = 'text';
  private texts: Text[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 30 + Math.floor(i / 10) * 110;
      const text = new Text({
        style: {
          x,
          y,
          text: `Text ${i}`,
          fontSize: 14,
          fill: `hsl(${(i * 30) % 360}, 70%, 40%)`,
          textBaseline: 'middle',
          textAlign: 'center',
        },
      });

      app.appendChild(text);
      this.texts.push(text);
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
    this.texts.forEach((text) => {
      text.remove();
    });
    this.texts = [];

    await super.cleanup(app);
  }
}
