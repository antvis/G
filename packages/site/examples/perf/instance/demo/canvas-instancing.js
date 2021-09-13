import { Circle, Line, Canvas, Batch } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

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
      node.labelCfg.style = {
        fontSize: 1.3,
      };
      node.degree = 0;
      data.edges.forEach((edge) => {
        if (edge.source === node.id || edge.target === node.id) {
          node.degree++;
        }
      });
    });
    mapNodeSize(data.nodes, 'degree', [1, 15]);

    // data.edges.slice(0, 100).forEach(({ startPoint, endPoint, size, color }) => {
    //   const line = new Line({
    //     style: {
    //       x1: startPoint.x,
    //       y1: startPoint.y,
    //       x2: endPoint.x,
    //       y2: endPoint.y,
    //       stroke: '#1890FF',
    //       lineWidth: .3,
    //     }
    //   });

    //   canvas.appendChild(line);
    // });

    // create a batch
    const circleBatch = new Batch({});

    data.nodes.forEach(({ size, x, y }) => {
      const circle = new Circle({
        style: {
          x,
          y,
          fill: '#C6E5FF',
          stroke: '#5B8FF9',
          r: size / 2,
          lineWidth: 1,
        },
      });
      circleBatch.addInstance(circle);
    });

    canvas.appendChild(circleBatch);
  });

// create a renderer
const webglRenderer = new WebGLRenderer();

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
canvas.on('afterrender', () => {
  if (stats) {
    stats.update();
  }

  root.style.origin = [300, 250];
  root.rotate(1);
});

const root = canvas.getRoot();
