import { Image } from '@antv/g-core';
import { Canvas } from '@antv/g-webgl';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const image = new Image({
  attrs: {
    x: 200,
    y: 100,
    width: 200,
    height: 200,
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  },
});

canvas.appendChild(image);

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
const imageFolder = gui.addFolder('image');
const config = {
  x: 200,
  y: 100,
  width: 200,
  height: 200,
  opacity: 1,
  anchorX: 0,
  anchorY: 0,
  src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
};
imageFolder.add(config, 'x', 0, 400).onChange((x) => {
  image.attr('x', x);
});
imageFolder.add(config, 'y', 0, 400).onChange((y) => {
  image.attr('y', y);
});
imageFolder.add(config, 'width', 0, 400).onChange((width) => {
  image.attr('width', width);
});
imageFolder.add(config, 'height', 0, 400).onChange((height) => {
  image.attr('height', height);
});
imageFolder.add(config, 'anchorX', 0, 1, 0.1).onChange((anchorX) => {
  image.attr('anchor', [anchorX, config.anchorY]);
});
imageFolder.add(config, 'anchorY', 0, 1, 0.1).onChange((anchorY) => {
  image.attr('anchor', [config.anchorX, anchorY]);
});
imageFolder.add(config, 'opacity', 0, 1, 0.1).onChange((opacity) => {
  image.attr('opacity', opacity);
});
imageFolder
  .add(config, 'src', [
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8eoKRbfOwgAAAAAAAAAAAABkARQnAQ',
  ])
  .onChange((src) => {
    image.attr('img', src);
  });
imageFolder.open();
