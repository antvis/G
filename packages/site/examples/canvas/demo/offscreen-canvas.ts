// @ts-ignore
import Worker from './main.worker.js';
import { setupTransferableMethodsOnMain } from '@naoak/workerize-transferable';

const worker = new Worker();

// create a canvas in main thread
const $canvas = document.createElement('canvas') as HTMLCanvasElement;
$canvas.height = 600;
$canvas.width = 500;
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
  await worker.render(offscreen, window.devicePixelRatio);
})();
