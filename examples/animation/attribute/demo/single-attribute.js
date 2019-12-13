import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const group = canvas.addGroup();

const circle1 = group.addShape('circle', {
  attrs: {
    x: 100,
    y: 100,
    r: 20,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

const circle2 = group.addShape('circle', {
  attrs: {
    x: 100,
    y: 200,
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

const circle3 = group.addShape('circle', {
  attrs: {
    x: 100,
    y: 300,
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

circle1.animate(
  {
    r: 50,
  },
  {
    delay: 0,
    duration: 2000,
    easing: 'easeLinear',
    callback: () => {},
    repeat: true,
  }
);

circle2.animate(
  {
    fill: '#F04864',
  },
  {
    delay: 0,
    duration: 2000,
    easing: 'easeLinear',
    callback: () => {},
    repeat: true,
  }
);

circle3.animate(
  {
    x: 500,
  },
  {
    delay: 0,
    duration: 2000,
    easing: 'easeQuadInOut',
    callback: () => {},
    repeat: true,
  }
);
