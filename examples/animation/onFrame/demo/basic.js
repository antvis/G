import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const group = canvas.addGroup();

const circle = group.addShape('circle', {
  attrs: {
    x: 100,
    y: 100,
    r: 20,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

circle.animate(onFrame, {
  duration: 2000,
  repeat: true,
});

function onFrame(ratio) {
  return {
    x: 100 + (500 - 200) * ratio,
    y: 100 + (400 - 100) * ratio,
    r: 20 + (50 - 20) * ratio,
  };
}
