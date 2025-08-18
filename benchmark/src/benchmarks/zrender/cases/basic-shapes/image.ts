import { type ZRenderType, Image } from 'zrender';
import { TestCase, type TestOptions } from '../../../../base';

export class ImageCase extends TestCase<ZRenderType> {
  readonly name = 'image';
  private images: Image[] = [];

  protected async execute(
    app: ZRenderType,
    options: TestOptions,
  ): Promise<void> {
    const { elementCount } = options;

    for (let i = 0; i < elementCount; i++) {
      const x = 10 + (i % 10) * 110;
      const y = 10 + Math.floor(i / 10) * 110;
      const image = new Image({
        shape: {
          x,
          y,
          width: 100,
          height: 100,
        },
        style: {
          image:
            'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        },
      });

      this.images.push(image);
      app.add(image);
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
    this.images.forEach((image) => app.remove(image));
    this.images = [];

    await super.cleanup(app);
  }
}
