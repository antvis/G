import { Canvas, CanvasEvent, Rect, Text, Group } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin as PluginYoga } from '@antv/g-plugin-yoga';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

const canvasRenderer = new CanvasRenderer();
const plugin = new PluginYoga();
canvasRenderer.registerPlugin(plugin);

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
    x: 50,
    y: 50,
    display: 'flex',
    padding: [10, 10, 10, 10],
  },
});
canvas.appendChild(root);

const leftPanel = new Rect({
  style: {
    fill: 'white',
    stroke: 'grey',
    lineWidth: 1,
    opacity: 0.8,
    display: 'flex',
    width: 'auto',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    marginRight: 10,
    padding: [10, 10, 10, 10],
  },
});
leftPanel.appendChild(
  new Text({
    style: {
      fontFamily: 'PingFang SC',
      fontSize: 32,
      fill: '#1890FF',
      text: '这是测试文字，这是测试文字，这是测试文字，这是测试文字',
      wordWrap: true,
    },
  }),
);
const rightPanel = new Group({
  style: {
    display: 'flex',
    flexDirection: 'column',
    width: 100,
    height: '100%',
  },
});
const node1 = new Rect({
  style: {
    fill: 'white',
    stroke: 'grey',
    lineWidth: 1,
    opacity: 0.8,
    height: 100,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});
node1.appendChild(
  new Text({
    style: {
      fontFamily: 'PingFang SC',
      fontSize: 32,
      fill: '#1890FF',
      text: '2',
    },
  }),
);
const node2 = new Rect({
  style: {
    fill: 'white',
    stroke: 'grey',
    lineWidth: 1,
    opacity: 0.8,
    width: '100%',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
node2.appendChild(
  new Text({
    style: {
      fontFamily: 'PingFang SC',
      fontSize: 32,
      fill: '#1890FF',
      text: '3',
    },
  }),
);

root.appendChild(leftPanel);
root.appendChild(rightPanel);
rightPanel.appendChild(node1);
rightPanel.appendChild(node2);

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

const layoutConfig = {
  width: 500,
  height: 300,
};
const layoutFolder = gui.addFolder("Container's Layout");
layoutFolder.add(layoutConfig, 'width', 100, 600).onChange((width) => {
  root.style.width = width;
});
layoutFolder.add(layoutConfig, 'height', 200, 500).onChange((height) => {
  root.style.height = height;
});
