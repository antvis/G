import { Canvas, CanvasEvent, Rect, Text } from '@antv/g';
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
    display: 'flex',
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
    opacity: 0.8,
    width: 100,
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
node1.appendChild(
  new Text({
    id: 'node1-text',
    style: {
      fontFamily: 'PingFang SC',
      fontSize: 32,
      fill: '#1890FF',
      text: '1',
    },
  }),
);
const node2 = new Rect({
  id: 'node2',
  style: {
    fill: 'white',
    stroke: 'grey',
    lineWidth: 1,
    opacity: 0.8,
    width: 100,
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
node2.appendChild(
  new Text({
    id: 'node2-text',
    style: {
      fontFamily: 'PingFang SC',
      fontSize: 32,
      fill: '#1890FF',
      text: '2',
    },
  }),
);
const node3 = new Rect({
  id: 'node3',
  style: {
    fill: 'white',
    stroke: 'grey',
    lineWidth: 1,
    opacity: 0.8,
    width: 100,
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
node3.appendChild(
  new Text({
    id: 'node3-text',
    style: {
      fontFamily: 'PingFang SC',
      fontSize: 32,
      fill: '#1890FF',
      text: '3',
    },
  }),
);

root.appendChild(node1);
root.appendChild(node2);
root.appendChild(node3);

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

const flexFolder = gui.addFolder("Node1's Flex");
const config = {
  flexGrow: 0,
};
flexFolder.add(config, 'flexGrow', 0, 1).onChange((flexGrow) => {
  node1.style.flexGrow = flexGrow;
});
