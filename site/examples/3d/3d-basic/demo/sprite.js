import {
  runtime,
  Canvas,
  CanvasEvent,
  Line,
  Text,
  Rect,
  Image,
  Circle,
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

  const icon = new Image({
    style: {
      x: 200,
      y: 200,
      z: 0,
      width: 200,
      height: 200,
      src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      isBillboard: true,
    },
  });
  canvas.appendChild(icon);

  // add a directional light into scene
  const light = new DirectionalLight({
    style: {
      fill: 'white',
      direction: [-1, 0, 1],
    },
  });
  canvas.appendChild(light);

  // adjust camera's position
  const camera = canvas.getCamera();
  camera.setPerspective(0.1, 5000, 90, 400 / 400);

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
