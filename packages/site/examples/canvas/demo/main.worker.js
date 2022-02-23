import { setupTransferableMethodsOnWorker } from '@naoak/workerize-transferable';
import { Circle, Canvas } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';

setupTransferableMethodsOnWorker({
  // the name of function which use some transferables
  render: {
    // specify an instance of the function
    fn: render,
  },
});

export function render(offscreenCanvas, devicePixelRatio) {
  // create a renderer
  const renderer = new WebGLRenderer({
    targets: ['webgl1'], // webgl2 seems not support transferable
    plugins: {
      enableDOMInteraction: false,
    },
  });

  // create a canvas
  const canvas = new Canvas({
    canvas: offscreenCanvas,
    devicePixelRatio,
    width: 600,
    height: 500,
    renderer,
  });

  // create a circle
  const circle = new Circle({
    style: {
      x: 300,
      y: 200,
      r: 50,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });

  // add a circle to canvas
  canvas.appendChild(circle);

  circle.animate(
    [
      {
        transform: 'scale(1)',
        fill: '#1890FF',
        stroke: '#F04864',
        opacity: 1,
        shadowColor: 'black',
        shadowBlur: 30,
      },
      {
        transform: 'scale(2)',
        fill: 'red',
        stroke: '#1890FF',
        opacity: 0.8,
        shadowColor: 'red',
        shadowBlur: 0,
      },
    ],
    {
      duration: 1500,
      iterations: Infinity,
      easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    },
  );
}
