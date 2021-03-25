import { Canvas } from '@antv/g-canvas';
import Stats from 'stats.js';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const image = canvas.addShape('image', {
  attrs: {
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  },
});

for (let i = 0; i < 1000; i++) {
  const size = 50 + Math.random() * 50;
  // add a circle to canvas
  const instance = image.createInstance({
    attrs: {
      x: Math.random() * 600,
      y: Math.random() * 500,
      width: size,
      height: size,
    },
  });
}

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.onFrame(() => {
  if (stats) {
    stats.update();
  }
});
