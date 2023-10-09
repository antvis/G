import { Canvas, CanvasEvent, Circle, Line, Group, runtime } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Plugin } from '@antv/g-plugin-dragndrop';
import Stats from 'stats.js';

/**
 * Compare with galaxyviz
 * @see https://github.com/galaxybase/GalaxyVis/blob/main/examples/test_all.ts#L12
 */

runtime.enableCSSParsing = false;

const NODE_NUM = 5000;
const EDGE_NUM = 5000;

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
  width: 500,
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

  const g1 = new Group({
    style: {
      zIndex: 2,
    },
  });
  const g2 = new Group({
    style: {
      zIndex: 1,
    },
  });

  const sourceMap = new WeakMap();
  const targetMap = new WeakMap();
  for (let i = 0; i < NODE_NUM; i++) {
    const fill = colors[Math.floor(Math.random() * colors.length) || 0];
    const circle = new Circle({
      style: {
        // cx: (i % num) * 10,
        // cy: Math.floor(i / num) * 10,
        cx: Math.random() * 500,
        cy: Math.random() * 500,
        fill,
        r: 4,
        // draggable: true
      },
    });
    nodes.push(circle);
    sourceMap.set(circle, []);
    targetMap.set(circle, []);

    circle.addEventListener('mouseenter', () => {
      circle.style.fill = 'red';
    });
    circle.addEventListener('mouseleave', () => {
      circle.style.fill = fill;
    });

    // const text = new Text({
    //   style: {
    //     x: 0,
    //     y: 4,
    //     text: `${i}`,
    //     textBaseline: "middle",
    //     textAlign: "center",
    //     fontSize: 4,
    //     fill: "black"
    //   }
    // });
    // circle.appendChild(text);
  }

  nodes.forEach((node) => {
    g1.appendChild(node);
  });

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
    sourceEdges.push(line);
    const targetEdges = targetMap.get(target);
    targetEdges.push(line);

    g2.appendChild(line);

    // line.addEventListener("mouseenter", () => {
    //   line.style.stroke = "red";
    // });
    // line.addEventListener("mouseleave", () => {
    //   line.style.stroke = "grey";
    // });
  }

  canvas.appendChild(g1);
  canvas.appendChild(g2);

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
