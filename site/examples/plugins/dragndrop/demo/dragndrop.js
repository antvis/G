import { Canvas, CanvasEvent, Image, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Plugin } from '@antv/g-plugin-dragndrop';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * Drag'n'Drop with PointerEvents
 * @see https://javascript.info/mouse-drag-and-drop
 */

const plugin = new Plugin({
  // we can drag the whole document from empty space now!
  isDocumentDraggable: true,
  isDocumentDroppable: true,
  dragstartDistanceThreshold: 10,
  dragstartTimeThreshold: 100,
});

// create a renderer
const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(plugin);
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'Roboto',
      url: '/Roboto-Regular.ttf',
    },
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
});
canvaskitRenderer.registerPlugin(plugin);
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(plugin);
const svgRenderer = new SVGRenderer();
svgRenderer.registerPlugin(plugin);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const gate = new Image({
    style: {
      droppable: true,
      x: 50,
      y: 100,
      width: 200,
      height: 100,
      src: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*wLJaQ4EuUSYAAAAAAAAAAAAADmJ7AQ/original',
    },
  });

  const ball = new Image({
    style: {
      draggable: true,
      x: 300,
      y: 200,
      width: 100,
      height: 100,
      src: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*StLOQqlKYr0AAAAAAAAAAAAADmJ7AQ/original',
      cursor: 'pointer',
    },
  });

  canvas.appendChild(gate);
  canvas.appendChild(ball);

  const gateText = new Text({
    style: {
      x: 50,
      y: 350,
      fill: 'black',
      text: '',
      pointerEvents: 'none',
    },
  });
  const ballText = new Text({
    style: {
      x: 50,
      y: 400,
      fill: 'black',
      text: '',
      pointerEvents: 'none',
    },
  });
  canvas.appendChild(gateText);
  canvas.appendChild(ballText);

  let shiftX = 0;
  let shiftY = 0;
  function moveAt(target, canvasX, canvasY) {
    target.setPosition(canvasX - shiftX, canvasY - shiftY);
  }

  ball.addEventListener('dragstart', function (e) {
    e.target.style.opacity = 0.5;
    ballText.style.text = 'ball dragstart';

    const [x, y] = e.target.getPosition();
    shiftX = e.canvasX - x;
    shiftY = e.canvasY - y;

    moveAt(e.target, e.canvasX, e.canvasY);
  });
  ball.addEventListener('drag', function (e) {
    moveAt(e.target, e.canvasX, e.canvasY);
    ballText.style.text = `ball drag movement: ${e.dx}, ${e.dy}`;
  });
  ball.addEventListener('dragend', function (e) {
    e.target.style.opacity = 1;
    ballText.style.text = 'ball dragend';
  });

  gate.addEventListener('dragenter', function (e) {
    e.target.style.opacity = 0.6;
    gateText.style.text = 'gate dragenter';
  });
  gate.addEventListener('dragleave', function (e) {
    e.target.style.opacity = 1;
    gateText.style.text = 'gate dragleave';
  });
  gate.addEventListener('dragover', function (e) {
    e.target.style.opacity = 0.6;
    gateText.style.text = 'gate dragover';
  });
  gate.addEventListener('drop', function (e) {
    e.target.style.opacity = 1;
    gateText.style.text = 'gate drop';
  });

  // move camera
  const camera = canvas.getCamera();
  canvas.addEventListener('drag', function (e) {
    if (e.target === canvas.document) {
      camera.pan(-e.dx, -e.dy);
    }
  });
  canvas.addEventListener('drop', function (e) {
    if (e.target === canvas.document) {
      console.log('drop on document');
    }
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
    } else if (rendererName === 'canvaskit') {
      renderer = canvaskitRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();
