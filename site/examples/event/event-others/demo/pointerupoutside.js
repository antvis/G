import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

/**
 * Trigger pointerdown on circle then trigger pointerupoutside on canvas.
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
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

circle.addEventListener('pointerupoutside', () => {
  console.log('pointerupoutside');
});
