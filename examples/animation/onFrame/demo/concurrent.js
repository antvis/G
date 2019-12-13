import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const circle1 = canvas.addShape('circle', {
  attrs: {
    x: 200,
    y: 200,
    r: 100,
    lineWidth: 4,
    stroke: '#1890FF',
  },
});

const circle2 = canvas.addShape('circle', {
  attrs: {
    x: 100,
    y: 200,
    r: 20,
    fill: '#F04864',
  },
});

let cx = 200;
let cy = 200;

circle1.animate(onFrame1, {
  duration: 2000,
  repeat: true,
});

circle2.animate(onFrame2, {
  duration: 2000,
  repeat: true,
});

function onFrame1(ratio) {
  const x = 200 + (400 - 200) * ratio;
  const y = 200 + (400 - 200) * ratio;
  cx = x;
  cy = y;
  return {
    x,
    y,
  };
}

function onFrame2(ratio) {
  return {
    x: cx + 100 * Math.cos(ratio * Math.PI * 2),
    y: cy + 100 * Math.sin(ratio * Math.PI * 2),
  };
}
