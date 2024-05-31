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
      x: 200,
      y: 200,
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
  x.childNodes[0].style.x = 300;
  canvas.appendChild(x);

  const y = origin.cloneNode(true);
  y.attr({
    y: 100,
  });
  y.childNodes[0].style.text = 'y';
  y.childNodes[0].style.y = 100;
  canvas.appendChild(y);

  const z = origin.cloneNode(true);
  z.attr({
    z: 100,
  });
  z.childNodes[0].style.text = 'z';
  z.childNodes[0].style.z = 100;
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
      isSizeAttenuation: true,
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
      isSizeAttenuation: true,
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
      isSizeAttenuation: true,
    },
  });
  canvas.appendChild(zAxis);

  const polyline3D = new Polyline({
    style: {
      stroke: '#1890FF',
      lineWidth: 10,
      lineCap: 'round',
      lineJoin: 'round',
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
      cursor: 'pointer',
      isBillboard: true,
    },
  });
  polyline3D.translate(0, 200);
  canvas.appendChild(polyline3D);

  const circle = new Circle({
    style: {
      cx: 200,
      cy: 200,
      r: 50,
      fill: 'red',
      isBillboard: true,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(circle);

  const rect = new Rect({
    style: {
      x: 100,
      y: 100,
      width: 10,
      height: 10,
      fill: 'red',
      isBillboard: true,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(rect);

  const path = new Path({
    style: {
      d: [
        ['M', 57.06339097770921, -18.541019662496844],
        ['L', 13.225168176580645, -18.202882373436317],
        ['L', 3.67394039744206e-15, -60],
        ['L', -13.225168176580643, -18.202882373436317],
        ['L', -57.06339097770921, -18.54101966249685],
        ['L', -21.398771616640953, 6.952882373436324],
        ['L', -35.267115137548394, 48.54101966249684],
        ['L', -4.133182947122317e-15, 22.5],
        ['L', 35.26711513754837, 48.54101966249685],
        ['L', 21.398771616640953, 6.952882373436322],
        ['Z'],
      ],
      stroke: '#1890FF',
      fill: '#1890FF',
      fillOpacity: 0.5,
      lineWidth: 10,
      lineCap: 'round',
      lineJoin: 'round',
      isBillboard: true,
      cursor: 'pointer',
    },
  });
  path.translate(100, 100, 0);
  canvas.appendChild(path);

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
