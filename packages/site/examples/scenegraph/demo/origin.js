import { Rect, Circle, Text, Group, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const circle = new Circle({
  style: {
    x: 100,
    y: 100,
    r: 100,
    fill: '#1890FF',
  },
});
canvas.appendChild(circle);
circle.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.5)' }], {
  duration: 500,
  easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  iterations: Infinity,
  direction: 'alternate',
});

const group = new Group({ id: 'group' });
const child1 = new Rect({
  id: 'rect1',
  style: {
    width: 100,
    height: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    radius: 8,
  },
});
group.appendChild(child1);
group.setPosition(200, 100);

const origin = new Circle({
  id: 'origin',
  style: {
    r: 30,
    fill: '#F04864',
  },
});
const originText = new Text({
  id: 'text',
  style: {
    fontFamily: 'PingFang SC',
    text: 'Origin',
    fontSize: 16,
    fill: '#fFF',
    textAlign: 'center',
    textBaseline: 'middle',
  },
});

origin.appendChild(originText);
origin.setPosition(200, 100);

canvas.appendChild(group);
canvas.appendChild(origin);

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
  group.rotateLocal(1);
});

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  originX: 0,
  originY: 0,
  transformOrigin: 'left top',
};
circleFolder.add(circleConfig, 'originX', -200, 200).onChange((tx) => {
  circle.style.origin = [tx, circleConfig.originY];
});
circleFolder.add(circleConfig, 'originY', -200, 200).onChange((ty) => {
  circle.style.origin = [circleConfig.originX, ty];
});
circleFolder.open();

let lastCloned = child1;
const rectFolder = gui.addFolder('group');
const rectConfig = {
  originX: 0,
  originY: 0,
  transformOrigin: 'left top',
  appendChild: () => {
    // reset rotation
    group.setEulerAngles(0);

    // clone child
    const cloned = lastCloned.cloneNode();
    cloned.id = 'cloned';
    cloned.translateLocal(0, 100);
    group.appendChild(cloned);
    lastCloned = cloned;

    // reset transform origin, which will case re-calc origin
    group.style.transformOrigin = group.style.transformOrigin;

    // get calculated origin
    const [ox, oy, oz] = group.style.origin;
    const [x, y, z] = group.getPosition(); // left top corner of Bounds
    origin.setPosition(x + ox, y + oy, z + oz);

    // update dat.gui
    rectConfig.originX = ox;
    rectConfig.originY = oy;
  },
};
rectFolder
  .add(rectConfig, 'transformOrigin', [
    'left top',
    'center',
    'right bottom',
    '50% 50%',
    '50px 50px',
  ])
  .onChange((transformOrigin) => {
    // reset rotation
    group.setEulerAngles(0);

    // set transformOrigin
    group.style.transformOrigin = transformOrigin;

    // get calculated origin
    const [ox, oy, oz] = group.style.origin;
    const [x, y, z] = group.getPosition(); // left top corner of Bounds
    origin.setPosition(x + ox, y + oy, z + oz);

    // update dat.gui
    rectConfig.originX = ox;
    rectConfig.originY = oy;
  });
rectFolder
  .add(rectConfig, 'originX', -200, 200)
  .onChange((tx) => {
    group.style.origin = [tx, rectConfig.originY];
    origin.setPosition(200 + tx, 100 + rectConfig.originY);
  })
  .listen();
rectFolder
  .add(rectConfig, 'originY', -200, 200)
  .onChange((ty) => {
    group.style.origin = [rectConfig.originX, ty];
    origin.setPosition(200 + rectConfig.originX, 100 + ty);
  })
  .listen();
rectFolder.add(rectConfig, 'appendChild');
rectFolder.open();
