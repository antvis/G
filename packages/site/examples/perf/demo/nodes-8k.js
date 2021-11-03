import { Circle, Line, Text, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';
import Hammer from 'hammerjs';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

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
    node.size = ((node[propertyName] - minp) / rangepLength) * rangevLength + visualRange[0];
  });
};

fetch('https://gw.alipayobjects.com/os/basement_prod/0b9730ff-0850-46ff-84d0-1d4afecd43e6.json')
  .then((res) => res.json())
  .then((data) => {
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
          x: x * 10,
          y: y * 10,
          fill: '#C6E5FF',
          stroke: '#5B8FF9',
          r: size * 10,
          lineWidth: 1,
        },
      });
      canvas.appendChild(circle);

      const text = new Text({
        style: {
          text: label,
          fontSize: 12,
          fontFamily: 'PingFang SC',
          fill: '#1890FF',
        },
      });
      circle.appendChild(text);

      circle.addEventListener('mouseenter', (e) => {
        circle.style.fill = '#2FC25B';
      });

      circle.addEventListener('mouseleave', (e) => {
        circle.style.fill = '#C6E5FF';
      });
    });
  });

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
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

const camera = canvas.getCamera();
camera.pan(1000, 800);
camera.setZoom(0.05);
canvas.on('afterrender', () => {
  if (stats) {
    stats.update();
  }

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
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'webgl',
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
  bindWheelHandler();
});
rendererFolder.open();
