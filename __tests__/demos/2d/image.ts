import { Image } from '@antv/g';

export async function image(context) {
  const { canvas } = context;
  await canvas.ready;

  const image1 = new Image({
    style: {
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
  });
  canvas.appendChild(image1);

  // Use `keepAspectRatio` so that the image will not be stretched
  const image2 = new Image({
    style: {
      x: 200,
      y: 100,
      width: 100,
      keepAspectRatio: true,
      src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(image2);
}
