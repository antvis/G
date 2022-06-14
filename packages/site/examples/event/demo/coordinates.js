import { Canvas, CanvasEvent, Circle, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'sans-serif',
      url: '/NotoSansCJKsc-VF.ttf',
    },
  ],
});
const webgpuRenderer = new WebGPURenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});
const camera = canvas.getCamera();

canvas.addEventListener(CanvasEvent.READY, () => {
  // add a circle to canvas
  const circle = new Circle({
    style: {
      cx: 300,
      cy: 200,
      r: 100,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
      cursor: 'pointer',
    },
  });

  canvas.appendChild(circle);

  circle.addEventListener('mouseenter', () => {
    circle.style.fill = '#2FC25B';
  });

  circle.addEventListener('mouseleave', () => {
    circle.style.fill = '#1890FF';
  });

  const clientText = new Text({
    style: {
      fill: '#000',
      fontSize: 22,
      text: 'Client: ',
      textBaseline: 'middle',
    },
  });
  clientText.setPosition(100, 80);
  canvas.appendChild(clientText);

  const canvasText = clientText.cloneNode();
  canvasText.style.text = 'Canvas: ';
  canvasText.setPosition(100, 110);
  canvas.appendChild(canvasText);

  const viewportText = clientText.cloneNode();
  viewportText.style.text = 'Viewport: ';
  viewportText.setPosition(100, 140);
  canvas.appendChild(viewportText);

  const screenText = clientText.cloneNode();
  screenText.style.text = 'Screen: ';
  screenText.setPosition(100, 20);
  canvas.appendChild(screenText);

  const pageText = clientText.cloneNode();
  pageText.style.text = 'Page: ';
  pageText.setPosition(100, 50);
  canvas.appendChild(pageText);

  canvas.addEventListener('mousemove', (e) => {
    const screenX = e.screenX;
    const screenY = e.screenY;
    screenText.style.text = `Screen: ${screenX}, ${screenY}`;

    const pageX = e.pageX;
    const pageY = e.pageY;
    pageText.style.text = `Page: ${pageX}, ${pageY}`;

    const clientX = e.clientX;
    const clientY = e.clientY;
    clientText.style.text = `Client: ${clientX}, ${clientY}`;

    const canvasX = e.canvasX;
    const canvasY = e.canvasY;
    canvasText.style.text = `Canvas: ${canvasX}, ${canvasY}`;

    const viewportX = e.viewportX;
    const viewportY = e.viewportY;
    viewportText.style.text = `Viewport: ${viewportX}, ${viewportY}`;
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
    .add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg'])
    .onChange((renderer) => {
      canvas.setRenderer(
        renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
      );
    });
  rendererFolder.open();

  const cameraFolder = gui.addFolder('camera actions');
  const cameraConfig = {
    x: 300,
    y: 250,
    panX: 0,
    panY: 0,
    zoom: 1,
    roll: 0,
  };

  const origin = camera.getPosition();
  cameraFolder.add(cameraConfig, 'x', 0, 500).onChange((x) => {
    const current = camera.getPosition();
    camera.setPosition(x, current[1]);
    camera.setFocalPoint(x, current[1]);
  });
  cameraFolder.add(cameraConfig, 'y', 0, 500).onChange((y) => {
    const current = camera.getPosition();
    camera.setPosition(current[0], y);
    camera.setFocalPoint(current[0], y);
  });
  cameraFolder.add(cameraConfig, 'panX', -300, 300).onChange((panX) => {
    const current = camera.getPosition();
    camera.pan(origin[0] + panX - current[0], 0);
  });
  cameraFolder.add(cameraConfig, 'panY', -300, 300).onChange((panY) => {
    const current = camera.getPosition();
    camera.pan(0, origin[1] + panY - current[1]);
  });
  cameraFolder.add(cameraConfig, 'roll', -90, 90).onChange((roll) => {
    camera.rotate(0, 0, roll);
  });
  cameraFolder.add(cameraConfig, 'zoom', 0, 10).onChange((zoom) => {
    camera.setZoom(zoom);
  });
  cameraFolder.open();
});
