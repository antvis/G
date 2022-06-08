import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { setupTransferableMethodsOnWorker } from '@naoak/workerize-transferable';

setupTransferableMethodsOnWorker({
  // the name of function which use some transferables
  render: {
    // specify an instance of the function
    fn: render,
  },
  triggerEvent: {
    fn: triggerEvent,
  },
});

let canvas;

export function render(offscreenCanvas, devicePixelRatio) {
  // create a renderer
  const renderer = new WebGLRenderer({
    targets: ['webgl1'], // webgl2 seems not support transferable
  });
  const domInteractionPlugin = renderer.getPlugin('dom-interaction');
  renderer.unregisterPlugin(domInteractionPlugin);

  // create a canvas
  canvas = new Canvas({
    canvas: offscreenCanvas,
    devicePixelRatio,
    renderer,
  });

  // create a circle
  const circle = new Circle({
    style: {
      cx: 300,
      cy: 200,
      r: 50,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });

  canvas.addEventListener(CanvasEvent.READY, () => {
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

    circle.addEventListener('pointerenter', () => {
      circle.style.lineWidth = 20;
    });
    circle.addEventListener('pointerleave', () => {
      circle.style.lineWidth = 4;
    });
  });
}

/**
 * receive signals from main thread
 */
export function triggerEvent(event, ev) {
  ev.target = canvas.getContextService().getDomElement();
  ev.preventDefault = () => {};
  ev.composedPath = () => {
    return [canvas.getContextService().getDomElement()];
  };

  if (event === 'pointermove') {
    canvas.getRenderingService().hooks.pointerMove.call(ev);
  } else if (event === 'pointerdown') {
    canvas.getRenderingService().hooks.pointerDown.call(ev);
  } else if (event === 'pointerleave') {
    canvas.getRenderingService().hooks.pointerOut.call(ev);
  } else if (event === 'pointerover') {
    canvas.getRenderingService().hooks.pointerOver.call(ev);
  } else if (event === 'pointerup') {
    canvas.getRenderingService().hooks.pointerUp.call(ev);
  }
}
