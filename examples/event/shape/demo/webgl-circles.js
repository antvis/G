import { Canvas } from '@antv/g-webgl';
import { Circle } from '@antv/g';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

for (let i = 0; i < 3; i++) {
  const circle = new Circle({
    attrs: {
      x: Math.random() * 600,
      y: Math.random() * 500,
      r: 20 + Math.random() * 10,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });

  canvas.appendChild(circle);

  circle.on('mouseenter', () => {
    circle.attr('fill', '#2FC25B');
  });

  circle.on('mouseleave', () => {
    circle.attr('fill', '#1890FF');
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

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const folder0 = gui.addFolder('dirty rectangle');
const dirtyRectangleConfig = {
  enable: true,
  // debug: true,
};
folder0.add(dirtyRectangleConfig, 'enable').onChange((enable) => {
  canvas.setConfig({
    dirtyRectangle: {
      enable,
      debug: dirtyRectangleConfig.debug,
    },
  });
});
// folder0.add(dirtyRectangleConfig, 'debug').onChange((debug) => {
//   canvas.setConfig({
//     dirtyRectangle: {
//       enable: dirtyRectangleConfig.enable,
//       debug,
//     }
//   });
// });
folder0.open();
