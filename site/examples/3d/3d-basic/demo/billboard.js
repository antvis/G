import {
  runtime,
  Canvas,
  CanvasEvent,
  Line,
  Text,
  Rect,
  Image,
  Circle,
  Path,
} from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshPhongMaterial,
  SphereGeometry,
  DirectionalLight,
  Mesh,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

runtime.enableCSSParsing = false;

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new Plugin3D());
renderer.registerPlugin(new PluginControl());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 400,
  height: 400,
  renderer,
});

(async () => {
  // wait for canvas' initialization complete
  await canvas.ready;
  // use GPU device
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  const origin = new Image({
    style: {
      x: 200,
      y: 200,
      z: 0,
      width: 20,
      height: 20,
      src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      isBillboard: true,
    },
  });
  canvas.appendChild(origin);

  const x = origin.cloneNode();
  x.attr({
    x: 300,
  });
  canvas.appendChild(x);

  const y = origin.cloneNode();
  y.attr({
    y: 100,
  });
  canvas.appendChild(y);

  const z = origin.cloneNode();
  z.attr({
    z: 100,
  });
  canvas.appendChild(z);

  const xAxis = new Line({
    style: {
      x1: 200,
      y1: 200,
      z1: 0,
      x2: 300,
      y2: 200,
      z2: 0,
      stroke: 'black',
      lineWidth: 2,
      isBillboard: true,
    },
  });
  canvas.appendChild(xAxis);

  const yAxis = new Line({
    style: {
      x1: 200,
      y1: 200,
      z1: 0,
      x2: 200,
      y2: 100,
      z2: 0,
      stroke: 'black',
      lineWidth: 2,
      isBillboard: true,
    },
  });
  canvas.appendChild(yAxis);

  const zAxis = new Line({
    style: {
      x1: 200,
      y1: 200,
      z1: 0,
      x2: 200,
      y2: 200,
      z2: 100,
      stroke: 'black',
      lineWidth: 2,
      isBillboard: true,
    },
  });
  canvas.appendChild(zAxis);

  // add a directional light into scene
  const light = new DirectionalLight({
    style: {
      fill: 'white',
      direction: [-1, 0, 1],
    },
  });
  canvas.appendChild(light);

  // adjust camera's position
  // const camera = canvas.getCamera();
  // camera.setPerspective(0.1, 5000, 90, 400 / 400);

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
