import {
  Canvas,
  CanvasEvent,
  Circle,
  Image,
  Polygon,
  Rect,
  Text,
} from '@antv/g';
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
      justifyContent: 'center',
      alignItems: 'center',
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
  const image = new Image({
    style: {
      width: 100,
      height: 100,
      img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
  });
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
    },
  });
  const circle = new Circle({
    style: {
      r: 20,
      fill: '#1890FF',
    },
  });

  root.appendChild(node1);
  root.appendChild(node2);
  root.appendChild(image);
  root.appendChild(polygon);
  root.appendChild(circle);

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

  const layoutFolder = gui.addFolder("Node1's Layout");
  // const flexFolder = gui.addFolder('Flex');
  const config = {
    // flexDirection: 'row',
    // flexWrap: 'no-wrap',
    position: 'relative',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    'top(percent)': 0,
    'right(percent)': 0,
    'bottom(percent)': 0,
    'left(percent)': 0,
    width: 100,
    height: 100,
    'width(percent)': 0,
    'height(percent)': 0,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    'marginTop(percent)': 0,
    'marginRight(percent)': 0,
    'marginBottom(percent)': 0,
    'marginLeft(percent)': 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
  };
  layoutFolder
    .add(config, 'position', ['relative', 'absolute'])
    .onChange((position) => {
      node1.style.position = position;
    });
  layoutFolder.add(config, 'top', -50, 50).onChange((top) => {
    node1.style.top = top;
  });
  layoutFolder.add(config, 'right', -50, 50).onChange((right) => {
    node1.style.right = right;
  });
  layoutFolder.add(config, 'bottom', -50, 50).onChange((bottom) => {
    node1.style.bottom = bottom;
  });
  layoutFolder.add(config, 'left', -50, 50).onChange((left) => {
    node1.style.left = left;
  });
  layoutFolder.add(config, 'top(percent)', -100, 100).onChange((topPercent) => {
    node1.style.top = `${topPercent}%`;
  });
  layoutFolder
    .add(config, 'right(percent)', -100, 100)
    .onChange((rightPercent) => {
      node1.style.right = `${rightPercent}%`;
    });
  layoutFolder
    .add(config, 'bottom(percent)', -100, 100)
    .onChange((bottomPercent) => {
      node1.style.bottom = `${bottomPercent}%`;
    });
  layoutFolder
    .add(config, 'left(percent)', -100, 100)
    .onChange((leftPercent) => {
      node1.style.left = `${leftPercent}%`;
    });
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
      node1.style.justifyContent = justifyContent;
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
      node1.style.alignItems = alignItems;
    });
  layoutFolder.add(config, 'width', 50, 200).onChange((width) => {
    node1.style.width = width;
  });
  layoutFolder.add(config, 'height', 50, 200).onChange((height) => {
    node1.style.height = height;
  });
  layoutFolder
    .add(config, 'width(percent)', 0, 100)
    .onChange((widthPercent) => {
      node1.style.width = `${widthPercent}%`;
    });
  layoutFolder
    .add(config, 'height(percent)', 0, 100)
    .onChange((heightPercent) => {
      node1.style.height = `${heightPercent}%`;
    });
  layoutFolder.add(config, 'marginTop', 0, 50).onChange((marginTop) => {
    node1.style.marginTop = marginTop;
  });
  layoutFolder.add(config, 'marginRight', 0, 50).onChange((marginRight) => {
    node1.style.marginRight = marginRight;
  });
  layoutFolder.add(config, 'marginBottom', 0, 50).onChange((marginBottom) => {
    node1.style.marginBottom = marginBottom;
  });
  layoutFolder.add(config, 'marginLeft', 0, 50).onChange((marginLeft) => {
    node1.style.marginLeft = marginLeft;
  });
  layoutFolder
    .add(config, 'marginTop(percent)', 0, 100)
    .onChange((marginTop) => {
      node1.style.marginTop = `${marginTop}%`;
    });
  layoutFolder
    .add(config, 'marginRight(percent)', 0, 100)
    .onChange((marginRight) => {
      node1.style.marginRight = `${marginRight}%`;
    });
  layoutFolder
    .add(config, 'marginBottom(percent)', 0, 100)
    .onChange((marginBottom) => {
      node1.style.marginBottom = `${marginBottom}%`;
    });
  layoutFolder
    .add(config, 'marginLeft(percent)', 0, 100)
    .onChange((marginLeft) => {
      node1.style.marginLeft = `${marginLeft}%`;
    });
  layoutFolder.add(config, 'paddingTop', 0, 50).onChange((paddingTop) => {
    node1.style.paddingTop = paddingTop;
  });
  layoutFolder.add(config, 'paddingRight', 0, 50).onChange((paddingRight) => {
    node1.style.paddingRight = paddingRight;
  });
  layoutFolder.add(config, 'paddingBottom', 0, 50).onChange((paddingBottom) => {
    node1.style.paddingBottom = paddingBottom;
  });
  layoutFolder.add(config, 'paddingLeft', 0, 50).onChange((paddingLeft) => {
    node1.style.paddingLeft = paddingLeft;
  });
});
