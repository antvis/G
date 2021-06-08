import { Canvas } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Cube, containerModule } from '@antv/g-plugin-3d';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// create a webgl renderer
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(containerModule);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

const camera = canvas.getCamera();
camera.setFocalPoint(300, 250, 0);
camera.setPosition(300, 250, 500);

// create a cube
const cube = new Cube({
  attrs: {
    width: 200,
    height: 200,
    depth: 200,
    fill: '#1890FF',
  },
});
cube.setPosition(300, 250, 0);

// add a cube to canvas
canvas.appendChild(cube);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('afterRender', () => {
  if (stats) {
    stats.update();
  }
  camera.rotate(1, 0, 0);
});

// GUI
// const gui = new dat.GUI({ autoPlace: false });
// $wrapper.appendChild(gui.domElement);

// const circleFolder = gui.addFolder('circle');
// const circleConfig = {
//   r: 100,
//   fill: '#1890FF',
//   stroke: '#F04864',
//   lineWidth: 4,
//   fillOpacity: 1,
//   strokeOpacity: 1,
// };
// circleFolder.add(circleConfig, 'r', 50, 200).onChange((radius) => {
//   circle.attr('r', radius);
// });
// circleFolder.addColor(circleConfig, 'fill').onChange((color) => {
//   circle.attr('fill', color);
// });
// circleFolder.addColor(circleConfig, 'stroke').onChange((color) => {
//   circle.attr('stroke', color);
// });
// circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
//   circle.attr('lineWidth', lineWidth);
// });
// circleFolder.add(circleConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
//   circle.attr('fillOpacity', opacity);
// });
// circleFolder.add(circleConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
//   circle.attr('strokeOpacity', opacity);
// });
// circleFolder.open();
