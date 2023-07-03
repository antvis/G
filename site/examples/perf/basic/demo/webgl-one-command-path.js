import { Canvas, CanvasEvent, Path } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const webglRenderer = new WebGLRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

const path = new Path({
  style: {
    lineWidth: 1,
    stroke: '#54BECC',
    path: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40',
  },
});
path.translate(100, 100);
canvas.appendChild(path);

const path2 = new Path({
  style: {
    lineWidth: 1,
    stroke: '#54BECC',
    path: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40',
  },
});
path2.translate(200, 200);
canvas.appendChild(path2);

const path3 = new Path({
  style: {
    lineWidth: 1,
    stroke: '#54BECC',
    path: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40',
  },
});
path3.translate(100, 200);
canvas.appendChild(path3);

const path4 = new Path({
  style: {
    lineWidth: 1,
    stroke: '#54BECC',
    path: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40',
  },
});
path4.translate(200, 100);
canvas.appendChild(path4);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const transformFolder = gui.addFolder('style');
const transformConfig = {
  lineWidth: 1,
};
transformFolder
  .add(transformConfig, 'lineWidth', 0, 20)
  .onChange((lineWidth) => {
    path.style.lineWidth = lineWidth;
    path2.style.lineWidth = lineWidth;
    path3.style.lineWidth = lineWidth;
    path4.style.lineWidth = lineWidth;
  });
