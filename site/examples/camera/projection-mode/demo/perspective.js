import { Canvas, CanvasEvent, Group } from '@antv/g';
import {
  CubeGeometry,
  Mesh,
  MeshBasicMaterial,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a webgl renderer
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(new Plugin3D());
webglRenderer.registerPlugin(new PluginControl());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

// create a perspective camera
const camera = canvas.getCamera();
camera.setPerspective(0.1, 1000, 75, 600 / 500);

const group = new Group();

(async () => {
  await canvas.ready;
  const plugin = webglRenderer.getPlugin('device-renderer');
  const device = plugin.getDevice();
  const map = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8TlCRIsKeUkAAAAAAAAAAAAAARQnAQ',
  );

  const cubeGeometry = new CubeGeometry(device, {
    width: 200,
    height: 200,
    depth: 200,
  });
  const basicMaterial = new MeshBasicMaterial(device, {
    map,
  });

  const cube = new Mesh({
    style: {
      fill: '#1890FF',
      opacity: 1,
      geometry: cubeGeometry,
      material: basicMaterial,
    },
  });
  cube.setPosition(300, 250, 0);

  canvas.appendChild(cube);
})();

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
  if (stats) {
    stats.update();
  }
  group.rotate(0, 1, 0);
});

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const cameraFolder = gui.addFolder('perspective');
const cameraConfig = {
  fov: 75,
  near: 0.1,
  far: 1000,
  zoom: 1,
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
cameraFolder.add(cameraConfig, 'zoom', 0, 10).onChange((zoom) => {
  camera.setZoom(zoom);
});
cameraFolder.open();
