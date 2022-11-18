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

canvas.addEventListener(CanvasEvent.READY, () => {
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
      flexGrow: 1,
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
      flexGrow: 1,
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
  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    if (stats) {
      stats.update();
    }
  });

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);

  const flexFolder1 = gui.addFolder("Node1's Flex");
  const config1 = {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: 0,
    minWidth: 0,
    setMaxWidthNaN: () => {
      node1.style.maxWidth = NaN;
    },
    setMinWidthNaN: () => {
      node1.style.minWidth = NaN;
    },
  };
  flexFolder1.add(config1, 'flexGrow', 0, 1).onChange((flexGrow) => {
    node1.style.flexGrow = flexGrow;
  });
  flexFolder1.add(config1, 'flexShrink', 0, 1).onChange((flexShrink) => {
    node1.style.flexShrink = flexShrink;
  });
  flexFolder1.add(config1, 'maxWidth', 0, 300).onChange((maxWidth) => {
    node1.style.maxWidth = maxWidth;
  });
  flexFolder1.add(config1, 'setMaxWidthNaN').name('set maxWidth to NaN');
  flexFolder1.add(config1, 'minWidth', 0, 300).onChange((minWidth) => {
    node1.style.minWidth = minWidth;
  });
  flexFolder1.add(config1, 'setMinWidthNaN').name('set minWidth to NaN');

  const flexFolder2 = gui.addFolder("Node2's Flex");
  const config2 = {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: 0,
    minWidth: 0,
    setMaxWidthNaN: () => {
      node2.style.maxWidth = NaN;
    },
    setMinWidthNaN: () => {
      node2.style.minWidth = NaN;
    },
  };
  flexFolder2.add(config2, 'flexGrow', 0, 1).onChange((flexGrow) => {
    node2.style.flexGrow = flexGrow;
  });
  flexFolder2.add(config2, 'flexShrink', 0, 1).onChange((flexShrink) => {
    node2.style.flexShrink = flexShrink;
  });
  flexFolder2.add(config2, 'maxWidth', 0, 300).onChange((maxWidth) => {
    node2.style.maxWidth = maxWidth;
  });
  flexFolder2.add(config2, 'setMaxWidthNaN').name('set maxWidth to NaN');
  flexFolder2.add(config2, 'minWidth', 0, 300).onChange((minWidth) => {
    node2.style.minWidth = minWidth;
  });
  flexFolder2.add(config2, 'setMinWidthNaN').name('set minWidth to NaN');

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
});
