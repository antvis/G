import { Canvas } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { MeshBasicMaterial, CubeGeometry, Mesh, Plugin as Plugin3D } from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
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

const camera = canvas.getCamera();
camera.setPerspective(0.1, 1000, 75, 600 / 500);

// create landmarks
camera.createLandmark('mark1', {
  position: [300, 250, 400],
  focalPoint: [300, 250, 0],
});
camera.createLandmark('mark2', {
  position: [300, 600, 500],
  focalPoint: [300, 250, 0],
});
camera.createLandmark('mark3', {
  position: [0, 250, 800],
  focalPoint: [300, 250, 0],
  roll: 30,
});

(async () => {
  await canvas.ready;
  const device = webglRenderer.getDevice();
  const map = webglRenderer.loadTexture(
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
canvas.on('afterrender', () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const cameraFolder = gui.addFolder('camera landmarks');
const cameraConfig = {
  goToMark1: () => {
    camera.gotoLandmark('mark1', 300);
  },
  goToMark2: () => {
    camera.gotoLandmark('mark2', 300);
  },
  goToMark3: () => {
    camera.gotoLandmark('mark3', 300);
  },
};
cameraFolder.add(cameraConfig, 'goToMark1');
cameraFolder.add(cameraConfig, 'goToMark2');
cameraFolder.add(cameraConfig, 'goToMark3');
cameraFolder.open();
