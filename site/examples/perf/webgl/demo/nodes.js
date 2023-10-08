import { Canvas, CanvasEvent, Circle, Line, Text, runtime } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Plugin } from '@antv/g-plugin-dragndrop';
import Stats from 'stats.js';

/**
 * Compare with galaxyviz
 * @see https://github.com/galaxybase/GalaxyVis/blob/main/examples/test_all.ts#L12
 */

runtime.enableCSSParsing = false;

const NODE_NUM = 50000;
const EDGE_NUM = 50000;

const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(
  new Plugin({
    isDocumentDraggable: true,
    isDocumentDroppable: true,
    dragstartDistanceThreshold: 10,
    dragstartTimeThreshold: 100,
  }),
);

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  let nodes = [];
  let colors = [
    '#965E04',
    '#C89435',
    '#F7A456',
    '#AFCF8A',
    '#7B39DE',
    '#B095C0',
    '#D24556',
    '#93C2FA',
    '#9DB09E',
    '#F8C821',
  ];
  let num = Math.floor(Math.sqrt(NODE_NUM) + 0.5);

  const sourceMap = new WeakMap();
  const targetMap = new WeakMap();
  for (let i = 0; i < NODE_NUM; i++) {
    const circle = new Circle({
      style: {
        cx: (i % num) * 10,
        cy: Math.floor(i / num) * 10,
        fill: colors[Math.floor(Math.random() * colors.length) || 0],
        r: 4,
      },
    });
    nodes.push(circle);
    sourceMap.set(circle, []);
  }

  for (let i = 0; i < EDGE_NUM; i++) {
    const source = nodes[Math.floor(Math.random() * NODE_NUM)];
    const target = nodes[Math.floor(Math.random() * NODE_NUM)];
    const line = new Line({
      style: {
        x1: source.style.cx,
        y1: source.style.cy,
        x2: target.style.cx,
        y2: target.style.cy,
        lineWidth: 0.3,
        stroke: 'grey',
      },
    });

    const sourceEdges = sourceMap.get(source);
    // sourceEdges.push(line);
    const targetEdges = targetMap.get(target);
    // targetEdges.push(line);

    canvas.appendChild(line);
  }

  nodes.forEach((circle) => {
    canvas.appendChild(circle);
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
  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    if (stats) {
      stats.update();
    }
  });

  let shiftX = 0;
  let shiftY = 0;
  function moveAt(target, canvasX, canvasY) {
    const x = canvasX - shiftX;
    const y = canvasY - shiftY;
    target.setPosition(x, y);
    const sourceEdges = sourceMap.get(target);
    const targetEdges = targetMap.get(target);
    sourceEdges.forEach((edge) => {
      edge.attr({
        x1: x,
        y1: y,
      });
    });
    targetEdges.forEach((edge) => {
      edge.attr({
        x2: x,
        y2: y,
      });
    });
  }

  canvas.addEventListener('dragstart', function (e) {
    canvas.getConfig().disableHitTesting = true;

    if (e.target === canvas.document) {
    } else {
      const [x, y] = e.target.getPosition();
      shiftX = e.canvasX - x;
      shiftY = e.canvasY - y;

      moveAt(e.target, e.canvasX, e.canvasY);
    }
  });
  canvas.addEventListener('drag', function (e) {
    if (e.target === canvas.document) {
      camera.pan(-e.dx, -e.dy);
    } else {
      moveAt(e.target, e.canvasX, e.canvasY);
    }
  });
  canvas.addEventListener('dragend', function (e) {
    console.log('dragend...');
    canvas.getConfig().disableHitTesting = false;
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
          canvas.getConfig().disableHitTesting = false;

          e.preventDefault();
          let zoom;
          if (e.deltaY < 0) {
            zoom = Math.max(
              minZoom,
              Math.min(maxZoom, camera.getZoom() / 0.95),
            );
          } else {
            zoom = Math.max(
              minZoom,
              Math.min(maxZoom, camera.getZoom() * 0.95),
            );
          }
          camera.setZoom(zoom);
        },
        { passive: false },
      );
  };
  bindWheelHandler();
});
