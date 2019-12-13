import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('text', {
  attrs: {
    x: 100,
    y: 100,
    fontFamily: 'PingFang SC',
    text: 'This is text',
    fontSize: 60,
    fill: '#1890FF',
    stroke: '#F04864',
  },
});
