import {
  runtime,
  Canvas,
  CanvasEvent,
  Line,
  Text,
  Rect,
  Image,
  CameraType,
  Circle,
  Polyline,
  Path,
} from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { DirectionalLight, Plugin as Plugin3D } from '@antv/g-plugin-3d';
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
      billboardRotation: Math.PI / 8,
    },
  });
  const label = new Text({
    style: {
      x: 20,
      text: '0',
      fontSize: 12,
      fill: 'black',
      isBillboard: true,
      billboardRotation: Math.PI / 8,
    },
  });
  origin.appendChild(label);
  canvas.appendChild(origin);

  const x = origin.cloneNode(true);
  x.attr({
    x: 300,
  });
  x.childNodes[0].style.text = 'x';
  canvas.appendChild(x);

  const y = origin.cloneNode(true);
  y.attr({
    y: 100,
  });
  y.childNodes[0].style.text = 'y';
  canvas.appendChild(y);

  const z = origin.cloneNode(true);
  z.attr({
    z: 100,
  });
  z.childNodes[0].style.text = 'z';
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

  const yAxis = new Path({
    style: {
      d: [
        ['M', 200, 200],
        ['L', 200, 100],
      ],
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

  const polyline = new Polyline({
    style: {
      stroke: '#1890FF',
      lineWidth: 10,
      lineCap: 'round',
      lineJoin: 'round',
      isBillboard: true,
      points: [
        [50, 50, 0],
        [100, 50, 100],
        [100, 100, 0],
        [150, 100, 100],
        [150, 150, 0],
        [200, 150, 0],
        [200, 200, 0],
        [250, 200, 0],
      ],
    },
  });
  polyline.translate(0, 200);
  canvas.appendChild(polyline);

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
  camera.setType(CameraType.ORBITING);

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
