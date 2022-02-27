// import { requestAnimationFrame, cancelAnimationFrame } from 'request-animation-frame-polyfill';
// export { requestAnimationFrame, cancelAnimationFrame };

import {
  requestAnimationFrame as rAF,
  cancelAnimationFrame as cancelRAF,
} from 'request-animation-frame-polyfill';

let requestAF = rAF;
let cancelAF = cancelRAF;

/**
 * use user-defined raf instead of requestAnimationFrame
 */
export function patch(
  requestAFPatch: (callback: Function) => number,
  cancelAFPatch: (id: number) => void,
) {
  requestAF = requestAFPatch;
  cancelAF = cancelAFPatch;
}

export const requestAnimationFrame = requestAF;
export const cancelAnimationFrame = cancelAF;
