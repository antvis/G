import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

/**
 * Listen to native click event in current environment instead of pointerup/down.
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
  useNativeClickEvent: true, //
});

// create a circle
const circle = new Circle({
  style: {
    cx: 300,
    cy: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    shadowColor: 'black',
    shadowBlur: 20,
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // add a circle to canvas
  canvas.appendChild(circle);
});

canvas.addEventListener('click', (e) => {
  if (e.target === circle) {
    circle.style.fill = '#F04864';
  } else {
    circle.style.fill = '#1890FF';
  }
});
