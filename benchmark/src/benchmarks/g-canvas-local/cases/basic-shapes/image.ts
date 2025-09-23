import { type Canvas, Image, CanvasEvent } from '@antv/g-local';
import { TestCase, type TestOptions } from '../../../../base';

export class ImageCase extends TestCase<Canvas> {
  name = 'image';
  private images: Image[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const image = new Image({
        style: {
          x,
          y,
          width: 100,
          height: 100,
          src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        },
      });

      app.appendChild(image);
      this.images.push(image);
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
    this.images.forEach((image) => image.remove());
    this.images = [];

    await super.cleanup(app);
  }
}
