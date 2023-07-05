import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshBasicMaterial,
  CubeGeometry,
  Mesh,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import { Plugin as PluginPhysX } from '@antv/g-plugin-physx';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new Plugin3D());
renderer.registerPlugin(new PluginControl());
renderer.registerPlugin(new PluginPhysX());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

// adjust camera's position
const camera = canvas.getCamera();
camera.setPerspective(0.1, 5000, 45, 600 / 500);

(async () => {
  await canvas.ready;
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();
  const map = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8TlCRIsKeUkAAAAAAAAAAAAAARQnAQ',
  );

  const planeGeometry = new CubeGeometry(device, {
    width: 500,
    height: 20,
    depth: 500,
  });
  const planeMaterial = new MeshBasicMaterial(device, {
    wireframe: true,
  });
  const plane = new Mesh({
    style: {
      fill: '#1890FF',
      geometry: planeGeometry,
      material: planeMaterial,
      rigid: 'static',
    },
  });
  plane.setPosition(300, 400, 0);
  canvas.appendChild(plane);

  const plane2 = new Mesh({
    style: {
      fill: '#1890FF',
      geometry: planeGeometry,
      material: planeMaterial,
      rigid: 'static',
    },
  });
  plane2.setPosition(300, 100, 0);
  canvas.appendChild(plane2);

  const cubeGeometry = new CubeGeometry(device, {
    width: 100,
    height: 100,
    depth: 100,
  });
  const basicMaterial = new MeshBasicMaterial(device, {
    map,
  });

  const cube = new Mesh({
    style: {
      fill: '#1890FF',
      geometry: cubeGeometry,
      material: basicMaterial,
      rigid: 'dynamic',
    },
  });
  cube.setPosition(300, -50, 0);
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
  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    if (stats) {
      stats.update();
    }
  });

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);
})();
