import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addGroup();
const commonAttrs = {
  r: 30,
  lineWidth: 2,
  stroke: '#F04864',
  fill: '#1890FF',
};

canvas.addShape('marker', {
  attrs: {
    ...commonAttrs,
    x: 100,
    y: 100,
    symbol: 'circle',
  },
});

canvas.addShape('marker', {
  attrs: {
    ...commonAttrs,
    x: 200,
    y: 100,
    symbol: 'square',
  },
});

canvas.addShape('marker', {
  attrs: {
    ...commonAttrs,
    x: 300,
    y: 100,
    symbol: 'diamond',
  },
});

canvas.addShape('marker', {
  attrs: {
    ...commonAttrs,
    x: 400,
    y: 100,
    symbol: 'triangle',
  },
});

canvas.addShape('marker', {
  attrs: {
    ...commonAttrs,
    x: 500,
    y: 100,
    symbol: 'triangle-down',
  },
});
