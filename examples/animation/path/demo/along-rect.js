import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

canvas.addShape('rect', {
  attrs: {
    x: 200,
    y: 100,
    width: 300,
    height: 200,
    lineWidth: 4,
    stroke: '#1890FF',
  },
});

const circle = canvas.addShape('circle', {
  attrs: {
    x: 200,
    y: 200,
    r: 20,
    fill: '#F04864',
  },
});

circle.animate(onFrame, {
  duration: 4000,
  repeat: true,
});

function onFrame(ratio) {
  const length = ratio * 1000;
  let x = 200;
  let y = 100;
  if (length >= 0 && length <= 300) {
    x = x + length;
    y = 100;
  } else if (length > 300 && length < 500) {
    x = 500;
    y = y + length - 300;
  } else if (length >= 500 && length <= 800) {
    x = x + 800 - length;
    y = 300;
  } else if (length > 800 && length < 1000) {
    x = 200;
    y = y + 1000 - length;
  }
  return {
    x,
    y,
  };
}
