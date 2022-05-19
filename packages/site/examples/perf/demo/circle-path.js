import { Circle, Canvas, Text, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
// import { Renderer as WebGLRenderer } from "@antv/g-webgl";
// import { Renderer as SVGRenderer } from "@antv/g-svg";
import Stats from 'stats-js';

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

/**
 * compared with G 4.0 ～20FPS
 * @see https://codesandbox.io/s/g-canvas-particles-2w-jyiie?file=/src/index.tsx
 */

const canvasRenderer = new CanvasRenderer();
// const webglRenderer = new WebGLRenderer();
// const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

let edgesNum = 2742;
for (let i = 0; i < edgesNum; i++) {
  const x = Math.random() * 600;
  const y = Math.random() * 500;
  canvas.appendChild(
    new Path({
      attrs: {
        path: [
          ['M', x, y],
          ['L', x + Math.random() * 100, y + Math.random() * 50],
        ],
        lineWidth: 1,
        stroke: '#000',
        lineWidth: 0.3,
      },
    }),
  );
}
let nodesNum = 1589;
for (let i = 0; i < nodesNum; i++) {
  const x = Math.random() * 600;
  const y = Math.random() * 500;
  canvas.appendChild(
    new Circle({
      attrs: {
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
        r: 2,
        cx: x,
        cy: y,
        lineWidth: 0.3,
      },
    }),
  );
  canvas.appendChild(
    new Text({
      attrs: {
        text: 'ccc',
        x,
        y,
        fill: '#ccc',
        fontSize: 12,
      },
    }),
  );
}

const camera = canvas.getCamera();
let count = 0;
let tag = 1;
const animate = () => {
  if (stats) {
    stats.update();
  }
  count++;
  if (count % 80 === 0) {
    count = 0;
    tag *= -1;
  }
  camera.pan(tag, tag);
  requestAnimationFrame(animate);
};

requestAnimationFrame(animate);
