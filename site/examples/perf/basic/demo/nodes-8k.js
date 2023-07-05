import {
  Canvas,
  CanvasEvent,
  Circle,
  Line,
  Image,
  Text,
  runtime,
} from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import Hammer from 'hammerjs';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

runtime.enableCSSParsing = false;

// create a renderer
// enable culling for canvas & svg renderer
const canvasRenderer = new CanvasRenderer({
  enableCulling: true,
});
const svgRenderer = new SVGRenderer({
  enableCulling: true,
});
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
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
    const line = new Line({
      style: {
        x1: startPoint.x * 10,
        y1: startPoint.y * 10,
        x2: endPoint.x * 10,
        y2: endPoint.y * 10,
        stroke: '#1890FF',
        lineWidth: 3,
      },
    });

    canvas.appendChild(line);
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

    let c1;
    circle.addEventListener('mouseenter', (e) => {
      circle.style.fill = '#2FC25B';
      text.style.fill = 'red';

      c1 = new Circle({
        style: {
          cx: 100,
          cy: 100,
          r: 1000,
          fill: '#2FC25B',
          zIndex: -1,
        },
      });

      // c1 = new Image({
      //   style: {
      //     x: 100,
      //     y: 100,
      //     width: 1000,
      //     height: 1000,
      //     src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      //     zIndex: -1,
      //   },
      // });
      canvas.appendChild(c1);
    });

    circle.addEventListener('mouseleave', (e) => {
      circle.style.fill = '#C6E5FF';
      text.style.fill = '#1890FF';

      if (c1) {
        canvas.removeChild(c1);
        c1 = undefined;
      }
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
  .add(rendererConfig, 'renderer', [
    'canvas',
    'svg',
    'webgl',
    'webgpu',
    'canvaskit',
  ])
  .onChange(async (rendererName) => {
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
    await canvas.setRenderer(renderer);
    bindWheelHandler();
  });
rendererFolder.open();
