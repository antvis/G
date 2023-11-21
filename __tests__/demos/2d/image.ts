import { Image } from '../../../packages/g';

export async function image(context) {
  const { canvas } = context;
  await canvas.ready;

  const image1 = new Image({
    style: {
      x: 200,
      y: 100,
      width: 200,
      height: 200,
      img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
  });
  canvas.appendChild(image1);
}
