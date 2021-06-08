import { Canvas, Group } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Cube, Grid, containerModule } from '@antv/g-plugin-3d';
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

// create a perspective camera
const camera = canvas.getCamera();
camera
  .setPosition(300, 100, 500)
  .setFocalPoint(300, 250, 0)
  .setPerspective(0.1, 1000, 75, 600 / 500);

const group = new Group();
const cube = new Cube({
  attrs: {
    width: 200,
    height: 200,
    depth: 200,
    fill: '#1890FF',
  },
});
const grid = new Grid({
  attrs: {
    width: 400,
    height: 400,
    fill: '#1890FF',
  },
});

group.appendChild(grid);
group.appendChild(cube);
grid.translateLocal(0, 100, 0);
group.setPosition(300, 250, 0);

// add a cube to canvas
canvas.appendChild(group);

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
  group.rotate(0, 1, 0);
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const cameraFolder = gui.addFolder('perspective');
const cameraConfig = {
  fov: 75,
  near: 0.1,
  far: 1000,
};
cameraFolder.add(cameraConfig, 'fov', 0, 180).onChange((fov) => {
  camera.setFov(fov);
});
cameraFolder.add(cameraConfig, 'near', 0, 600).onChange((near) => {
  camera.setNear(near);
});
cameraFolder.add(cameraConfig, 'far', 0, 1000).onChange((far) => {
  camera.setFar(far);
});
cameraFolder.open();
