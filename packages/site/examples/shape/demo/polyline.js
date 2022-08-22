import { Canvas, CanvasEvent, Circle, Polyline } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
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
const webgpuRenderer = new WebGPURenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const circle = new Circle({
  style: {
    r: 5,
    fill: 'red',
  },
});

const polyline = new Polyline({
  style: {
    points: [
      [100, 20],
      [160, 20],
      [160, 40],
      [100, 40],
    ],
    stroke: 'blue',
    markerEnd: circle,
    markerStart: circle,
    markerMid: circle,
  },
});
const polyline2 = polyline.cloneNode(true);
polyline2.style.points = [
  [100, 70],
  [160, 70],
  [160, 90],
  [100, 90],
];
// polyline2.style.markerStartOffset = 20;

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(polyline2);

  console.log(polyline2);
});
