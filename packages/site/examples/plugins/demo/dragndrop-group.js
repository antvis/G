import { Canvas, CanvasEvent, Circle, Group, Text } from '@antv/g';
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
      url: '/NotoSans-Regular.ttf',
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
  const g1 = new Group({
    style: {
      draggable: true,
    },
  });
  const node1 = new Circle({
    style: {
      r: 50,
      cx: -50,
      cy: -50,
      fill: 'blue',
      cursor: 'move',
    },
  });
  const text1 = new Text({
    style: {
      fill: 'white',
      text: 'node1',
      textAlign: 'center',
      textBaseline: 'middle',
      pointerEvents: 'none',
    },
  });
  g1.appendChild(node1);
  node1.appendChild(text1);

  const g2 = g1.cloneNode(true);
  const node2 = g2.childNodes[0];
  node2.style.cx = 50;
  node2.style.cy = 50;
  node2.children[0].style.text = 'node2';

  const group1 = new Circle({
    style: {
      droppable: true,
      r: 120,
      cx: 150,
      cy: 200,
      fill: 'white',
      stroke: 'black',
    },
  });
  const group2 = group1.cloneNode();
  group2.style.cx = 400;
  group2.style.zIndex = -1;

  group1.appendChild(g1);
  group1.appendChild(g2);

  canvas.appendChild(group1);
  canvas.appendChild(group2);

  // move camera
  const camera = canvas.getCamera();

  let shiftX = 0;
  let shiftY = 0;
  function moveAt(target, canvasX, canvasY) {
    target.setPosition(canvasX - shiftX, canvasY - shiftY);
  }
  canvas.addEventListener('dragstart', function (e) {
    const { target, canvasX, canvasY } = e;

    console.log(target);

    switch (target) {
      case g1:
      case g2:
        const [x, y] = target.getPosition();
        shiftX = canvasX - x;
        shiftY = canvasY - y;

        moveAt(target, canvasX, canvasY);
        target.style.opacity = 0.5;
    }
  });
  canvas.addEventListener('drag', function (e) {
    const { target, canvasX, canvasY, dx, dy } = e;

    switch (target) {
      case canvas.document:
        camera.pan(-dx, -dy);
        break;
      case g1:
      case g2:
        moveAt(target, canvasX, canvasY);
        target.style.opacity = 0.5;
        break;
    }
  });
  canvas.addEventListener('dragend', function (e) {
    const { target } = e;

    switch (target) {
      case g1:
      case g2:
        target.style.opacity = 1;
        console.log(e.target);
    }
  });

  canvas.addEventListener('dragenter', function (e) {
    const { target } = e;

    switch (target) {
      case group1:
      case group2:
        target.style.fill = 'rgba(0,0,0,0.5)';
    }
  });
  canvas.addEventListener('dragleave', function (e) {
    const { target } = e;

    switch (target) {
      case group1:
      case group2:
        target.style.fill = 'white';
    }
  });
  // canvas.addEventListener('dragover', function (e) {
  //   e.target.style.opacity = 0.6;
  //   gateText.style.text = 'gate dragover';
  // });
  canvas.addEventListener('drop', function (e) {
    const { target } = e;

    switch (target) {
      case canvas.document:
        console.log('drop on document');
        break;
      case group1:
      case group2:
        target.style.fill = 'white';
        break;
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
  .add(rendererConfig, 'renderer', ['canvas', 'svg', 'webgl', 'webgpu', 'canvaskit'])
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
