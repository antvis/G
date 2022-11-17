import {
  Canvas,
  CanvasEvent,
  Circle,
  Image,
  Line,
  Polygon,
  Rect,
  Text,
} from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import { Plugin as PluginBox2D } from '@antv/g-plugin-box2d';
import Stats from 'stats.js';

const renderer = new Renderer();
const plugin = new PluginBox2D();
renderer.registerPlugin(plugin);

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const ground1 = new Line({
    style: {
      x1: 0,
      y1: 200,
      x2: 50,
      y2: 400,
      stroke: '#1890FF',
      lineWidth: 2,
      width: 1000,
      height: 10,
      rigid: 'static', // static ground
    },
  });
  canvas.appendChild(ground1);
  const ground2 = new Line({
    style: {
      x1: 50,
      y1: 400,
      x2: 400,
      y2: 400,
      stroke: '#1890FF',
      lineWidth: 2,
      width: 1000,
      height: 10,
      rigid: 'static', // static ground
    },
  });
  canvas.appendChild(ground2);
  const ground3 = new Line({
    style: {
      x1: 400,
      y1: 400,
      x2: 400,
      y2: 200,
      stroke: '#1890FF',
      lineWidth: 2,
      width: 1000,
      height: 10,
      rigid: 'static', // static ground
    },
  });
  canvas.appendChild(ground3);

  for (let i = 0; i < 10; i++) {
    const rect = new Rect({
      style: {
        fill: '#C6E5FF',
        stroke: '#1890FF',
        lineWidth: 2,
        width: 50,
        height: 50,
        rigid: 'dynamic',
        density: 10,
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
    });

    rect.setRotation(0, 0, 0.3, 0.7);
    canvas.appendChild(rect);
  }

  const circle = new Circle({
    style: {
      fill: '#1890FF',
      r: 50,
      rigid: 'dynamic',
      density: 10,
      restitution: 0.5,
      cx: 300,
      cy: 0,
    },
  });
  canvas.appendChild(circle);
  const text = new Text({
    id: 'text',
    style: {
      fontFamily: 'PingFang SC',
      text: 'Circle',
      fontSize: 16,
      fill: '#fFF',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });
  circle.appendChild(text);

  const polygon = new Polygon({
    style: {
      points: [
        [20, 10],
        [40, 10],
        [40 + 20 * Math.sin(Math.PI / 6), 10 + 20 * Math.cos(Math.PI / 6)],
        [40, 10 + 20 * Math.cos(Math.PI / 6) * 2],
        [20, 10 + 20 * Math.cos(Math.PI / 6) * 2],
        [20 - 20 * Math.sin(Math.PI / 6), 10 + 20 * Math.cos(Math.PI / 6)],
      ],
      fill: '#C6E5FF',
      stroke: '#1890FF',
      lineWidth: 2,
      rigid: 'dynamic',
      density: 10,
    },
  });
  polygon.setPosition(100, 100);
  canvas.appendChild(polygon);

  const image = new Image({
    style: {
      x: 200,
      y: 100,
      width: 80,
      height: 80,
      img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      rigid: 'dynamic',
      density: 10,
    },
  });
  canvas.appendChild(image);

  // const slope = new Polyline({
  //   style: {
  //     points: [
  //       [0, 200],
  //       [50, 400],
  //       [400, 400],
  //       [400, 200],
  //     ],
  //     stroke: '#1890FF',
  //     lineWidth: 2,
  //     rigid: 'static', // static ground
  //   },
  // });
  // canvas.appendChild(slope);
});

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
// const gui = new lil.GUI({ autoPlace: false });
// $wrapper.appendChild(gui.domElement);
// const forceFolder = gui.addFolder('force');
// const forceConfig = {
//   applyForce: () => {
//     plugin.applyForce(circle, [0, -100], [0, 0]);
//   },
// };
// forceFolder.add(forceConfig, 'applyForce').name('applyForce');
