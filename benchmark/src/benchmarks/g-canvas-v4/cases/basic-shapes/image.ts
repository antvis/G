import { type Canvas, Shape } from '@antv/g-canvas-v4';
import { TestCase, type TestOptions } from '../../../../base';

export class ImageCase extends TestCase<Canvas> {
  name = 'image';
  private images: Shape.Image[] = [];

  protected async execute(app: Canvas, options: TestOptions): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 60 + (i % 10) * 110;
      const y = 60 + Math.floor(i / 10) * 110;
      const image = new Shape.Image({
        type: 'image',
        attrs: {
          x,
          y,
          width: 100,
          height: 100,
          img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        },
      });

      app.add(image);
      this.images.push(image);
    }

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  protected async cleanup(app: Canvas): Promise<void> {
    this.images.forEach((image) => image.remove());
    this.images = [];

    await super.cleanup(app);
  }
}
