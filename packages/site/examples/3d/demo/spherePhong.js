import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshPhongMaterial,
  SphereGeometry,
  PlaneGeometry,
  DirectionalLight,
  AmbientLight,
  Mesh,
  Fog,
  FogType,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const renderer = new Renderer({
  targets: ['webgl1'],
});
renderer.registerPlugin(new Plugin3D());
renderer.registerPlugin(new PluginControl());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

(async () => {
  // wait for canvas' initialization complete
  await canvas.ready;
  // use GPU device
  const device = renderer.getDevice();

  const geometry = new SphereGeometry(device, {
    radius: 200,
    latitudeBands: 32,
    longitudeBands: 32,
  });

  // const geometry = new PlaneGeometry(device, {
  //   width: 200,
  //   depth: 200,
  //   widthSegments: 1,
  //   depthSegments: 1,
  // });

  const basicMaterial = new MeshPhongMaterial(device, {
    specular: 'white',
    bumpScale: 5,
    shininess: 10,
  });

  // create a mesh
  const sphere = new Mesh({
    style: {
      x: 300,
      y: 250,
      z: 0,
      fill: '#f00',
      opacity: 1,
      geometry: geometry,
      material: basicMaterial,
    },
  });
  canvas.appendChild(sphere);

  const light = new DirectionalLight({
    style: {
      fill: 'white',
      direction: [-1, 0, 1],
    },
  });
  // canvas.appendChild(light);

  const ambientLight = new AmbientLight({
    style: {
      fill: '#fff',
    },
  });
  canvas.appendChild(ambientLight);

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
})();
