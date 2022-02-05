import { Canvas, CanvasEvent } from '@antv/g';
import { Spreadsheet } from '@antv/g-components';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

const sheet = new Spreadsheet('container', {
  width: 1200,
  height: 800,
});
sheet.render();

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
sheet.g.on(CanvasEvent.AFTER_RENDER, () => {
  if (stats) {
    stats.update();
  }
});
