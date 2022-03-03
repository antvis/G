import { Canvas, CanvasEvent, Rect, Line, Polyline, Polygon, Circle, Image, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Plugin as PluginYoga } from '@antv/g-plugin-yoga';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

const canvasRenderer = new CanvasRenderer();
// const webglRenderer = new WebGLRenderer();
// const svgRenderer = new SVGRenderer();

canvasRenderer.registerPlugin(new PluginYoga());
// webglRenderer.registerPlugin(new PluginYoga());
// svgRenderer.registerPlugin(new PluginYoga());

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const root = new Rect({
  id: 'root',
  style: {
    fill: '#C6E5FF',
    width: 500,
    height: 300,
    display: 'flex',
    justifyContent: 'center',
    x: 50,
    y: 50,
  },
});
canvas.appendChild(root);

const node1 = new Rect({
  id: 'node1',
  style: {
    fill: 'white',
    stroke: 'grey',
    lineWidth: 1,
    width: 100,
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
// node1.appendChild(
//   new Text({
//     id: 'node1-text',
//     style: {
//       fontFamily: 'PingFang SC',
//       fontSize: 32,
//       fill: '#1890FF',
//       text: '1',
//     },
//   }),
// );
const node2 = new Rect({
  id: 'node2',
  style: {
    fill: 'white',
    stroke: 'grey',
    lineWidth: 1,
    width: 100,
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
// node2.appendChild(
//   new Text({
//     id: 'node2-text',
//     style: {
//       fontFamily: 'PingFang SC',
//       fontSize: 32,
//       fill: '#1890FF',
//       text: '2',
//     },
//   }),
// );
root.appendChild(node1);
root.appendChild(node2);

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

const layoutFolder = gui.addFolder('Layout');
const config = {
  justifyContent: 'center',
  alignItems: 'stretch',
  width: 500,
  height: 300,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  appendChild: () => {},
};
layoutFolder
  .add(config, 'justifyContent', [
    'flex-start',
    'flex-end',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
  ])
  .onChange((justifyContent) => {
    root.style.justifyContent = justifyContent;
  });
layoutFolder
  .add(config, 'alignItems', [
    'stretch',
    'auto',
    'baseline',
    'center',
    'flex-start',
    'flex-end',
    'space-between',
    'space-around',
  ])
  .onChange((alignItems) => {
    root.style.alignItems = alignItems;
  });
layoutFolder.add(config, 'width', 200, 600).onChange((width) => {
  root.style.width = width;
});
layoutFolder.add(config, 'height', 200, 500).onChange((height) => {
  root.style.height = height;
});
layoutFolder.add(config, 'paddingTop', 0, 50).onChange((paddingTop) => {
  root.style.paddingTop = paddingTop;
});
layoutFolder.add(config, 'paddingRight', 0, 50).onChange((paddingRight) => {
  root.style.paddingRight = paddingRight;
});
layoutFolder.add(config, 'paddingBottom', 0, 50).onChange((paddingBottom) => {
  root.style.paddingBottom = paddingBottom;
});
layoutFolder.add(config, 'paddingLeft', 0, 50).onChange((paddingLeft) => {
  root.style.paddingLeft = paddingLeft;
});
