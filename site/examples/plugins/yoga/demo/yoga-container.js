import { Canvas, CanvasEvent, Rect, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Plugin as PluginYoga } from '@antv/g-plugin-yoga';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
});
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

const plugin = new PluginYoga();

canvasRenderer.registerPlugin(plugin);
webglRenderer.registerPlugin(plugin);
svgRenderer.registerPlugin(plugin);

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // you can use Group if you want this container invisible
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
      opacity: 0.8,
      width: 100,
      height: 100,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // alignSelf: 'center'
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
  const rendererFolder = gui.addFolder('renderer');
  const rendererConfig = {
    renderer: 'canvas',
  };
  rendererFolder
    .add(rendererConfig, 'renderer', [
      'canvas',
      'svg',
      'webgl',
      'webgpu',
      'canvaskit',
    ])
    .onChange((rendererName) => {
      let renderer;
      if (rendererName === 'canvas') {
        renderer = canvasRenderer;
      } else if (rendererName === 'svg') {
        renderer = svgRenderer;
      } else if (rendererName === 'webgl') {
        renderer = webglRenderer;
      } else if (rendererName === 'canvaskit') {
        renderer = canvaskitRenderer;
      }
      canvas.setRenderer(renderer);
    });
  rendererFolder.open();

  const layoutFolder = gui.addFolder('Layout');
  const flexFolder = gui.addFolder('Flex');
  const config = {
    flexDirection: 'row',
    flexWrap: 'no-wrap',
    justifyContent: 'center',
    alignItems: 'stretch',
    alignContent: 'flex-start',
    width: 500,
    height: 300,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    'paddingTop(percent)': 0,
    'paddingRight(percent)': 0,
    'paddingBottom(percent)': 0,
    'paddingLeft(percent)': 0,
    appendChild: () => {
      const num = root.children.length;
      const id = num + 1;
      const rect = new Rect({
        id: `node${id}`,
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
      const text = new Text({
        id: `node${id}-text`,
        style: {
          fontFamily: 'PingFang SC',
          fontSize: 32,
          fill: '#1890FF',
          text: `${id}`,
        },
      });
      rect.appendChild(text);
      root.appendChild(rect);
    },
    removeChild: () => {
      const num = root.children.length;
      if (num) {
        root.removeChild(root.children[num - 1]);
      }
    },
  };
  flexFolder
    .add(config, 'flexDirection', [
      'row',
      'column',
      'row-reverse',
      'column-reverse',
    ])
    .onChange((flexDirection) => {
      root.style.flexDirection = flexDirection;
    });
  flexFolder
    .add(config, 'flexWrap', ['wrap', 'no-wrap', 'wrap-reverse'])
    .onChange((flexWrap) => {
      root.style.flexWrap = flexWrap;
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
  layoutFolder
    .add(config, 'alignContent', [
      'stretch',
      'center',
      'flex-start',
      'flex-end',
      'space-between',
      'space-around',
    ])
    .onChange((alignContent) => {
      root.style.alignContent = alignContent;
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
  layoutFolder
    .add(config, 'paddingTop(percent)', 0, 100)
    .onChange((paddingTop) => {
      root.style.paddingTop = `${paddingTop}%`;
    });
  layoutFolder
    .add(config, 'paddingRight(percent)', 0, 100)
    .onChange((paddingRight) => {
      root.style.paddingRight = `${paddingRight}%`;
    });
  layoutFolder
    .add(config, 'paddingBottom(percent)', 0, 100)
    .onChange((paddingBottom) => {
      root.style.paddingBottom = `${paddingBottom}%`;
    });
  layoutFolder
    .add(config, 'paddingLeft(percent)', 0, 100)
    .onChange((paddingLeft) => {
      root.style.paddingLeft = `${paddingLeft}%`;
    });
  layoutFolder.add(config, 'appendChild').name('appendChild');
  layoutFolder.add(config, 'removeChild').name('removeChild');
});
