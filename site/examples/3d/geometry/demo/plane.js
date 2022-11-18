import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
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
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  const planeGeometry = new PlaneGeometry(device, {
    width: 200,
    depth: 200,
    widthSegments: 1,
    depthSegments: 1,
  });
  const basicMaterial = new MeshBasicMaterial(device, {
    wireframe: true,
  });

  const plane = new Mesh({
    style: {
      fill: '#1890FF',
      opacity: 1,
      geometry: planeGeometry,
      material: basicMaterial,
    },
  });

  plane.setPosition(300, 250, 0);
  canvas.appendChild(plane);

  const plane2 = new Mesh({
    style: {
      fill: '#1890FF',
      opacity: 1,
      width: 400,
      depth: 400,
      geometry: planeGeometry,
      material: basicMaterial,
    },
  });
  plane2.setPosition(300, 450, 0);
  canvas.appendChild(plane2);

  canvas.getCamera().setPosition(300, 0, 500);

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
    // plane.rotate(0, 1, 0);
  });

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);

  const planeFolder = gui.addFolder('plane');
  const planeConfig = {
    opacity: 1,
    fill: '#1890FF',
  };
  planeFolder.add(planeConfig, 'opacity', 0, 1, 0.1).onChange((opacity) => {
    plane.style.opacity = opacity;
  });
  planeFolder.addColor(planeConfig, 'fill').onChange((color) => {
    plane.style.fill = color;
  });
  planeFolder.open();

  const geometryFolder = gui.addFolder('geometry');
  const geometryConfig = {
    width: 200,
    depth: 200,
    widthSegments: 5,
    depthSegments: 5,
  };
  geometryFolder.add(geometryConfig, 'width', 50, 300).onChange((width) => {
    planeGeometry.width = width;
  });
  geometryFolder.add(geometryConfig, 'depth', 50, 300).onChange((depth) => {
    planeGeometry.depth = depth;
  });
  geometryFolder
    .add(geometryConfig, 'widthSegments', 1, 10, 1)
    .onChange((widthSegments) => {
      planeGeometry.widthSegments = widthSegments;
    });
  geometryFolder
    .add(geometryConfig, 'depthSegments', 1, 10, 1)
    .onChange((depthSegments) => {
      planeGeometry.depthSegments = depthSegments;
    });
  geometryFolder.open();
})();
