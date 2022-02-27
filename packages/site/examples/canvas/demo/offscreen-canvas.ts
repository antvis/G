// @ts-ignore
import Worker from './main.worker.js';
import { setupTransferableMethodsOnMain } from '@naoak/workerize-transferable';

const worker = new Worker();

// create a canvas in main thread
const $canvas = document.createElement('canvas') as HTMLCanvasElement;
const dpr = window.devicePixelRatio;
$canvas.height = dpr * 600;
$canvas.width = dpr * 500;
$canvas.style.height = '600px';
$canvas.style.width = '500px';
document.getElementById('container').appendChild($canvas);

// transfer canvas to worker
const offscreen = $canvas.transferControlToOffscreen();

setupTransferableMethodsOnMain(
  // worker instance
  worker,
  // the name of method which use some transferables
  {
    render: {
      // pick a transferable object from the method parameters
      pickTransferablesFromParams: (params) => [params[0]],
    },
  },
);

(async () => {
  await worker.render(offscreen, dpr);
})();
