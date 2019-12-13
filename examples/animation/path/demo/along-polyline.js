import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const polyline = canvas.addShape('polyline', {
  attrs: {
    points: [
      [50, 50],
      [100, 50],
      [100, 100],
      [150, 100],
      [150, 150],
      [200, 150],
      [200, 200],
      [250, 200],
      [250, 250],
      [300, 250],
      [300, 300],
      [350, 300],
      [350, 350],
      [400, 350],
      [400, 400],
      [450, 400],
    ],
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

circle.animate((ratio) => polyline.getPoint(ratio), {
  duration: 5000,
  repeat: true,
});
