import { Canvas, CanvasEvent, Circle, Rect, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Plugin } from '@antv/g-plugin-css-select';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import interact from 'interactjs';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * use interact.js
 * @see https://interactjs.io/
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

// register css select plugin
canvasRenderer.registerPlugin(new Plugin());
webglRenderer.registerPlugin(new Plugin());
svgRenderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  /**
   * Draggable
   */
  const circle = new Circle({
    className: 'draggable',
    style: {
      fill: 'rgb(239, 244, 255)',
      fillOpacity: 1,
      lineWidth: 1,
      opacity: 1,
      r: 60,
      stroke: 'rgb(95, 149, 255)',
      strokeOpacity: 1,
      zIndex: 1,
    },
  });
  const text = new Text({
    style: {
      text: 'Drag me',
      fontSize: 22,
      fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });
  circle.appendChild(text);
  canvas.appendChild(circle);
  circle.setPosition(100, 100);
  interact(circle, {
    context: canvas.document,
  }).draggable({
    onmove: function (event) {
      const { dx, dy } = event;
      circle.translateLocal(dx, dy);
    },
  });

  /**
   * Resizable
   */
  const resizableRect = new Rect({
    style: {
      x: 220,
      y: 260,
      width: 200,
      height: 200,
      fill: '#1890FF',
    },
  });
  const resizableRectText = new Text({
    style: {
      text: 'Resize from any edge or corner',
      fontSize: 16,
      fill: 'white',
      textAlign: 'left',
      textBaseline: 'top',
      wordWrap: true,
      wordWrapWidth: 200,
    },
  });
  resizableRectText.translateLocal(0, 20);
  resizableRect.appendChild(resizableRectText);
  canvas.appendChild(resizableRect);
  interact(resizableRect, {
    context: canvas.document,
  }).resizable({
    edges: { top: true, left: true, bottom: true, right: true },
    onmove: function (event) {
      resizableRect.translateLocal(event.deltaRect.left, event.deltaRect.top);
      resizableRect.style.width = event.rect.width;
      resizableRect.style.height = event.rect.height;

      resizableRectText.style.wordWrapWidth = event.rect.width;
    },
  });

  /**
   * Drop zone
   */
  const dropZone = new Rect({
    style: {
      x: 100,
      y: 50,
      width: 300,
      height: 200,
      fill: '#1890FF',
    },
  });
  canvas.appendChild(dropZone);
  interact(dropZone, {
    context: canvas.document,
  }).dropzone({
    accept: '.draggable',
    overlap: 0.75,
    ondragenter: function (event) {
      text.style.text = 'Dragged in';
    },
    ondragleave: function (event) {
      text.style.text = 'Dragged out';
    },
    ondrop: function (event) {
      text.style.text = 'Dropped';
    },
    ondropactivate: function (event) {
      // add active dropzone feedback
      event.target.style.fill = '#4e4';
    },
    ondropdeactivate: function (event) {
      event.target.style.fill = '#1890FF';
    },
  });

  /**
   * Gesture
   */
  const gesture = new Circle({
    style: {
      fill: 'rgb(239, 244, 255)',
      fillOpacity: 1,
      lineWidth: 1,
      opacity: 1,
      r: 60,
      stroke: 'rgb(95, 149, 255)',
      strokeOpacity: 1,
    },
  });
  const gestureText = new Text({
    style: {
      text: 'Tap to Change color\n Doubletap to change size\n Hold to rotate',
      fontSize: 12,
      fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });
  gesture.appendChild(gestureText);
  canvas.appendChild(gesture);
  gesture.setPosition(500, 100);
  let tapped = false;
  let doubleTapped = false;
  interact(gesture, {
    context: canvas.document,
  })
    .on('tap', function (event) {
      event.currentTarget.style.fill = tapped ? 'red' : 'rgb(239, 244, 255)';
      tapped = !tapped;
      event.preventDefault();
    })
    .on('doubletap', function (event) {
      event.currentTarget.style.r = doubleTapped ? 100 : 60;
      doubleTapped = !doubleTapped;
      event.preventDefault();
    })
    .on('hold', function (event) {
      event.currentTarget.rotateLocal(30);
    });

  /**
   * Snapping
   */
  const snapRect = new Rect({
    style: {
      fill: 'rgb(239, 244, 255)',
      fillOpacity: 1,
      lineWidth: 1,
      opacity: 1,
      width: 200,
      height: 200,
      stroke: 'rgb(95, 149, 255)',
      strokeOpacity: 1,
    },
  });
  const snapCircle = new Circle({
    style: {
      fill: 'rgb(239, 244, 255)',
      fillOpacity: 1,
      lineWidth: 1,
      opacity: 1,
      r: 30,
      stroke: 'rgb(95, 149, 255)',
      strokeOpacity: 1,
    },
  });
  const snapText = new Text({
    style: {
      text: 'Drag me',
      fontSize: 12,
      fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });
  snapRect.appendChild(snapCircle);
  snapCircle.appendChild(snapText);
  canvas.appendChild(snapRect);
  snapRect.setPosition(0, 260);
  snapCircle.translateLocal(150, 150);
  interact(snapCircle, {
    context: canvas.document,
  }).draggable({
    modifiers: [
      interact.modifiers.restrict({
        restriction: snapCircle.parentNode,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        endOnly: true,
      }),
    ],
    inertia: true,
    onmove: function (event) {
      const { dx, dy } = event;
      snapCircle.translateLocal(dx, dy);
    },
  });
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
    } else if (rendererName === 'webgpu') {
      renderer = webgpuRenderer;
    } else if (rendererName === 'canvaskit') {
      renderer = canvaskitRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();
