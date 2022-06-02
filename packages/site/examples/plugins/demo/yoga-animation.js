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

  node1.animate(
    [
      { top: 0, left: 0, width: 100, marginAll: 0, paddingLeft: 0 },
      { top: 100, left: 100, width: 200, marginAll: 20, paddingLeft: 50 },
    ],
    {
      duration: 1000,
      easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
      fill: 'both',
      iterations: Infinity,
      direction: 'alternate-reverse',
    },
  );

  node2.animate([{ flexGrow: 1 }, { flexGrow: 0.5 }], {
    duration: 1000,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    fill: 'both',
    iterations: Infinity,
    direction: 'alternate-reverse',
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
});
