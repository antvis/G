import { Canvas, Image as GImage } from '@antv/g';

/**
 * @see https://github.com/antvis/G/pull/1906
 */
export async function issue_1906(context: { canvas: Canvas }) {
  const { canvas } = context;
  await canvas.ready;
  canvas.context.config.enableLargeImageOptimization = true;

  const img = new Image();
  img.onload = () => {
    console.log('onload', img.complete);

    // remove && expect no error
    requestAnimationFrame(() => {
      image.remove();
    });
  };

  let image = new GImage({
    style: {
      x: 0,
      y: 0,
      src: img,
    },
  });

  img.src =
    'https://mdn.alipayobjects.com/huamei_fr7vu1/afts/img/A*SqloToP7R9QAAAAAAAAAAAAADkn0AQ/original';

  canvas.appendChild(image);
}
