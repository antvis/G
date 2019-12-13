import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('image', {
  attrs: {
    x: 200,
    y: 100,
    width: 200,
    height: 200,
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  },
});
