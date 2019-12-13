import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const line = canvas.addShape('line', {
  attrs: {
    x1: 100,
    y1: 100,
    x2: 400,
    y2: 300,
    lineWidth: 4,
    stroke: '#1890FF',
  },
});

const circle = canvas.addShape('circle', {
  attrs: {
    x: 100,
    y: 300,
    r: 20,
    fill: '#F04864',
  },
});

circle.animate((ratio) => line.getPoint(ratio), {
  duration: 1000,
  repeat: true,
});
