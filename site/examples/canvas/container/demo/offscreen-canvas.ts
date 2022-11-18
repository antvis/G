import { setupTransferableMethodsOnMain } from '@naoak/workerize-transferable';
// @ts-ignore
import Worker from 'workerize-loader?inline!./main.worker.js';

const worker = new Worker();

// create a canvas in main thread
const $canvas = document.createElement('canvas') as HTMLCanvasElement;
const dpr = window.devicePixelRatio;
$canvas.height = dpr * 600;
$canvas.width = dpr * 500;
$canvas.style.height = '600px';
$canvas.style.width = '500px';
document.getElementById('container').appendChild($canvas);

const { left, top } = $canvas.getBoundingClientRect();
const clonePointerEvent = (e: PointerEvent) => {
  return {
    cancelable: e.cancelable,
    pointerId: e.pointerId,
    width: e.width,
    height: e.height,
    isPrimary: e.isPrimary,
    pointerType: e.pointerType,
    pressure: e.pressure,
    tangentialPressure: e.tangentialPressure,
    tiltX: e.tiltX,
    tiltY: e.tiltY,
    twist: e.twist,
    isTrusted: e.isTrusted,
    type: e.type,
    altKey: e.altKey,
    button: e.button,
    buttons: e.buttons,
    clientX: e.clientX - left, // account for $canvas' offset
    clientY: e.clientY - top,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    movementX: e.movementX,
    movementY: e.movementY,
    pageX: e.pageX,
    pageY: e.pageY,
    screenX: e.screenX,
    screenY: e.screenY,
  };
};

// listen to pointer events and transfer them to worker
document.addEventListener(
  'pointermove',
  (e) => {
    worker.triggerEvent('pointermove', clonePointerEvent(e));
  },
  true,
);
$canvas.addEventListener(
  'pointerdown',
  (e) => {
    worker.triggerEvent('pointerdown', clonePointerEvent(e));
  },
  true,
);
$canvas.addEventListener(
  'pointerleave',
  (e) => {
    worker.triggerEvent('pointerleave', clonePointerEvent(e));
  },
  true,
);
$canvas.addEventListener(
  'pointerover',
  (e) => {
    worker.triggerEvent('pointerover', clonePointerEvent(e));
  },
  true,
);
window.addEventListener(
  'pointerup',
  (e) => {
    worker.triggerEvent('pointerup', clonePointerEvent(e));
  },
  true,
);

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
  // do rendering in WebWorker
  await worker.render(offscreen, dpr);
})();
