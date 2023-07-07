import { Canvas, CanvasEvent, Circle, Path, Text, runtime } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import { vec2 } from 'gl-matrix';
import Hammer from 'hammerjs';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

runtime.enableCSSParsing = false;

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

// ported from G6 @see https://g6.antv.vision/zh/examples/performance/perf#eva

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

const getControlPoint = (startPoint, endPoint, percent, offset) => {
  const point = {
    x: (1 - percent) * startPoint.x + percent * endPoint.x,
    y: (1 - percent) * startPoint.y + percent * endPoint.y,
  };

  let tangent = [0, 0];
  vec2.normalize(tangent, [
    endPoint.x - startPoint.x,
    endPoint.y - startPoint.y,
  ]);

  if (!tangent || (!tangent[0] && !tangent[1])) {
    tangent = [0, 0];
  }
  const perpendicular = [-tangent[1] * offset, tangent[0] * offset]; // 垂直向量
  point.x += perpendicular[0];
  point.y += perpendicular[1];
  return point;
};

(async () => {
  const [_, data] = await Promise.all([
    canvas.ready,
    fetch(
      'https://gw.alipayobjects.com/os/basement_prod/0b9730ff-0850-46ff-84d0-1d4afecd43e6.json',
    ).then((res) => res.json()),
  ]);

  data.nodes.forEach((node) => {
    node.label = node.olabel;
    node.degree = 0;
    data.edges.forEach((edge) => {
      if (edge.source === node.id || edge.target === node.id) {
        node.degree++;
      }
    });
  });
  mapNodeSize(data.nodes, 'degree', [1, 15]);

  /**
   * Draw edges
   */
  data.edges.forEach(({ startPoint, endPoint }) => {
    const cp = getControlPoint(
      { x: startPoint.x * 10, y: startPoint.y * 10 },
      { x: endPoint.x * 10, y: endPoint.y * 10 },
      0.5,
      50,
    );
    const path = new Path({
      style: {
        d: [
          ['M', startPoint.x * 10, startPoint.y * 10],
          ['Q', cp.x, cp.y, endPoint.x * 10, endPoint.y * 10],
        ],
        stroke: '#1890FF',
        lineWidth: 3,
      },
    });

    canvas.appendChild(path);
    path.addEventListener('mouseenter', (e) => {
      path.style.stroke = 'red';
    });

    path.addEventListener('mouseleave', (e) => {
      path.style.stroke = '#1890FF';
    });
  });

  /**
   * Draw nodes
   */
  data.nodes.forEach(({ size, x, y, label }) => {
    const circle = new Circle({
      style: {
        cx: x * 10,
        cy: y * 10,
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
        r: size * 10,
        lineWidth: 1,
        batchKey: 'node', // merge all circles into a single batch
      },
    });
    canvas.appendChild(circle);

    const text = new Text({
      style: {
        text: label,
        fontSize: 12,
        fontFamily: 'sans-serif',
        fill: '#1890FF',
      },
    });
    circle.appendChild(text);

    circle.addEventListener('mouseenter', (e) => {
      circle.style.fill = '#2FC25B';
      text.style.fill = 'red';
    });

    circle.addEventListener('mouseleave', (e) => {
      circle.style.fill = '#C6E5FF';
      text.style.fill = '#1890FF';
    });
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
camera.pan(1000, 800);
camera.setZoom(0.05);
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
  if (stats) {
    stats.update();
  }
  // console.log(canvas.getStats());

  // manipulate camera instead of the root of canvas
  camera.rotate(0, 0, 0.1);
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
const hammer = new Hammer(canvas);
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
