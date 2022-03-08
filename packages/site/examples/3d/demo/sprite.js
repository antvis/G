import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshBasicMaterial,
  SpriteMaterial,
  PlaneGeometry,
  CloudGeometry,
  Mesh,
  Sprite,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import { vec3 } from 'gl-matrix';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const renderer = new Renderer();
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

  const vertexs = [
    [-100, 0, 100],
    [-100, 0, -0],
    [-100, 0, -100],
    [100, 0, 100],
    [100, 0, -0],
    [100, 0, -100],
  ];

  const cloudGeometry = new CloudGeometry(device, {
    vertexs,
  });

  const spriteMaterial = new SpriteMaterial(device);

  const plane2 = new Mesh({
    style: {
      fill: '#f00',
      opacity: 1,
      width: 400,
      depth: 400,
      geometry: cloudGeometry,
      material: spriteMaterial,
    },
  });
  plane2.setPosition(300, 450, 0);
  canvas.appendChild(plane2);

  canvas.getCamera().setPosition(300, 0, 500);

  // stats

  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {});
})();
