import { Image, Group, Rect } from '@antv/g';

export async function image(context) {
  const { canvas } = context;
  await canvas.ready;

  const rect = new Rect({
    style: {
      x: 0,
      y: 0,
      width: 600,
      height: 600,
    },
  });
  const group = new Group({
    style: {
      clipPath: rect,
    },
  });
  canvas.appendChild(group);

  const img = new window.Image();
  img.onload = () => {
    const image = new Image({
      style: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        src: img,
      },
    });
    const image2 = new Image({
      style: {
        x: 50,
        y: 0,
        width: 100,
        height: 100,
        src: img,
      },
    });
    group.appendChild(image);
    group.appendChild(image2);
  };
  img.src =
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ';
  img.crossOrigin = 'anonymous';
}
