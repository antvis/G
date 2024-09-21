import { Image } from '@antv/g';

export async function imageNonTransparentPixel(context) {
  const { canvas } = context;
  await canvas.ready;

  const image1 = new Image({
    style: {
      x: 200,
      y: 100,
      width: 200,
      height: 200,
      src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      pointerEvents: 'non-transparent-pixel',
      cursor: 'pointer',
      transform: 'translate(-100, 0) scale(1.2)',
    },
  });
  canvas.appendChild(image1);
}
