import { Canvas, CanvasEvent, Circle, Line } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import Hammer from 'hammerjs';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// ported from G6 @see https://g6.antv.vision/zh/examples/performance/perf#moreData

// create a renderer
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

const mapNodeSize = (nodes, propertyName, visualRange) => {
  let minp = 9999999999;
  let maxp = -9999999999;
  nodes.forEach((node) => {
    node[propertyName] = Math.pow(node[propertyName], 1 / 3);
    minp = node[propertyName] < minp ? node[propertyName] : minp;
    maxp = node[propertyName] > maxp ? node[propertyName] : maxp;
  });
  const rangepLength = maxp - minp;
  const rangevLength = visualRange[1] - visualRange[0];
  nodes.forEach((node) => {
    node.size =
      ((node[propertyName] - minp) / rangepLength) * rangevLength +
      visualRange[0];
  });
};

(async () => {
  const [_, data] = await Promise.all([
    canvas.ready,
    fetch(
      'https://gw.alipayobjects.com/os/bmw-prod/f1565312-d537-4231-adf5-81cb1cd3a0e8.json',
    ).then((res) => res.json()),
  ]);

  data.nodes.forEach((node) => {
    node.degree = 0;
    data.edges.forEach((edge) => {
      if (edge.source === node.id || edge.target === node.id) {
        node.degree++;
      }
    });
  });
  mapNodeSize(data.nodes, 'degree', [1, 15]);

  data.edges.forEach(({ source, target }) => {
    const startPoint = data.nodes.find((node) => node.id === source);
    const endPoint = data.nodes.find((node) => node.id === target);

    if (startPoint && endPoint) {
      const line = new Line({
        style: {
          x1: startPoint.x,
          y1: startPoint.y,
          x2: endPoint.x,
          y2: endPoint.y,
          stroke: '#1890FF',
          lineWidth: 0.3,
        },
      });
      canvas.appendChild(line);
    }
  });

  data.nodes.forEach(({ size, x, y }) => {
    const circle = new Circle({
      style: {
        cx: x,
        cy: y,
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
        r: size,
        lineWidth: 1,
      },
    });
    canvas.appendChild(circle);
  });
})();

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);

const camera = canvas.getCamera();
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
  if (stats) {
    stats.update();
  }

  // manipulate camera instead of the root of canvas
  camera.rotate(0, 0, 1);
});

// handle mouse wheel event
const bindWheelHandler = () => {
  // update Camera's zoom
  // @see https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js
  const minZoom = 0;
  const maxZoom = Infinity;
  canvas
    .getContextService()
    .getDomElement() // g-canvas/webgl 为 <canvas>，g-svg 为 <svg>
    .addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        let zoom;
        if (e.deltaY < 0) {
          zoom = Math.max(minZoom, Math.min(maxZoom, camera.getZoom() / 0.95));
        } else {
          zoom = Math.max(minZoom, Math.min(maxZoom, camera.getZoom() * 0.95));
        }
        camera.setZoom(zoom);
      },
      { passive: false },
    );
};

// use hammer.js
const hammer = new Hammer(canvas.document);
hammer.on('pan', (ev) => {
  camera.pan(
    -ev.deltaX / Math.pow(2, camera.getZoom()),
    -ev.deltaY / Math.pow(2, camera.getZoom()),
  );
});

bindWheelHandler();

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'webgl',
};
rendererFolder
  .add(rendererConfig, 'renderer', ['webgl', 'webgpu'])
  .onChange((rendererName) => {
    let renderer;
    if (rendererName === 'webgl') {
      renderer = webglRenderer;
    } else if (rendererName === 'webgpu') {
      renderer = webgpuRenderer;
    }
    canvas.setRenderer(renderer);
    bindWheelHandler();
  });
rendererFolder.open();
