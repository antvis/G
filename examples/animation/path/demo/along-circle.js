import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('circle', {
  attrs: {
    x: 300,
    y: 200,
    r: 100,
    lineWidth: 4,
    stroke: '#1890FF',
  },
});

const circle = canvas.addShape('circle', {
  attrs: {
    x: 100,
    y: 200,
    r: 20,
    fill: '#F04864',
  },
});

circle.animate(onFrame, {
  duration: 2000,
  repeat: true,
});

function onFrame(ratio) {
  return {
    x: 300 + 100 * Math.cos(ratio * Math.PI * 2),
    y: 200 + 100 * Math.sin(ratio * Math.PI * 2),
  };
}
