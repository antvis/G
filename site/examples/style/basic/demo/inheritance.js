import { Canvas, CanvasEvent, Group, Rect, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * inheritance
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance
 */

// create a renderer
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

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  /**
   * default values defined in <Text>:
   * * fill: 'black'
   *
   * inherit from document.documentElement:
   * * fontSize: '16px'
   * * fontFamily: 'sans-serif'
   * * fontStyle: 'normal'
   * * fontWeight: 'normal'
   * * fontVariant: 'normal'
   * * visibility: 'visible'
   * * pointerEvents: 'auto'
   */
  const text1 = new Text({
    style: {
      x: 100,
      y: 100,
      text: 'hello',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(text1);

  /**
   * override default value `fill` with `red`:
   */
  const text2 = new Text({
    style: {
      x: 100,
      y: 150,
      text: 'hello',
      fill: 'red',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(text2);

  /**
   * override inherited `fontSize`
   */
  const text3 = new Text({
    style: {
      x: 100,
      y: 200,
      text: 'hello',
      fill: 'red',
      fontSize: 20, // user-defined
      cursor: 'pointer',
    },
  });
  canvas.appendChild(text3);

  const rect = new Rect({
    style: {
      x: 100,
      y: 250,
      width: 300,
      height: 50,
      fill: 'grey',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(rect);
  /**
   * inherit from <Rect> which is also inherited from document.documentElement.
   */
  const text4 = new Text({
    style: {
      y: 12,
      text: 'hello from <Rect>',
      cursor: 'pointer',
    },
  });
  rect.appendChild(text4);

  /**
   * override `fontSize`
   */
  const group = new Group({
    style: {
      x: 100,
      y: 400,
      fontSize: 32,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(group);
  const text5 = new Text({
    style: {
      y: 12,
      text: 'hello from <Group>',
      cursor: 'pointer',
    },
  });
  group.appendChild(text5);
  const text6 = new Text({
    style: {
      y: 32,
      text: 'hello from <Group>',
      cursor: 'pointer',
    },
  });
  group.appendChild(text6);

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
    .add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg'])
    .onChange((renderer) => {
      canvas.setRenderer(
        renderer === 'canvas'
          ? canvasRenderer
          : renderer === 'webgl'
          ? webglRenderer
          : svgRenderer,
      );
    });
  rendererFolder.open();

  const documentElementFolder = gui.addFolder('documentElement');
  const documentElementConfig = {
    fontSize: 16,
    fontFamily: 'sans-serif',
    fontStyle: 'normal',
    visibility: 'unset',
    pointerEvents: 'unset',
  };
  documentElementFolder
    .add(documentElementConfig, 'fontSize', 1, 32)
    .onChange((fontSize) => {
      canvas.document.documentElement.style.fontSize = `${fontSize}px`;
    });
  documentElementFolder
    .add(documentElementConfig, 'fontFamily', [
      'PingFang SC',
      'fantasy',
      'Arial',
      'Times',
      'Microsoft YaHei',
    ])
    .onChange((fontFamily) => {
      canvas.document.documentElement.style.fontFamily = fontFamily;
    });
  documentElementFolder
    .add(documentElementConfig, 'fontStyle', ['normal', 'italic', 'oblique'])
    .onChange((fontStyle) => {
      canvas.document.documentElement.style.fontStyle = fontStyle;
    });
  documentElementFolder
    .add(documentElementConfig, 'visibility', ['unset', 'visible', 'hidden'])
    .onChange((visibility) => {
      canvas.document.documentElement.style.visibility = visibility;
    });
  documentElementFolder
    .add(documentElementConfig, 'pointerEvents', ['unset', 'auto', 'none'])
    .onChange((pointerEvents) => {
      canvas.document.documentElement.style.pointerEvents = pointerEvents;
    });

  const groupFolder = gui.addFolder('group');
  const groupConfig = {
    fontSize: 32,
    visibility: 'unset',
    pointerEvents: 'unset',
  };
  groupFolder.add(groupConfig, 'fontSize', 1, 32).onChange((fontSize) => {
    group.style.fontSize = `${fontSize}px`;
  });
  groupFolder
    .add(groupConfig, 'visibility', ['unset', 'visible', 'hidden'])
    .onChange((visibility) => {
      group.style.visibility = visibility;
    });
  groupFolder
    .add(groupConfig, 'pointerEvents', ['unset', 'auto', 'none'])
    .onChange((pointerEvents) => {
      group.style.pointerEvents = pointerEvents;
    });
  groupFolder.open();
});
