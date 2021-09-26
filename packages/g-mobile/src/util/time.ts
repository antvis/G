const canvas: {
  requestAnimationFrame?: any;
  clearAnimationFrame?: any;
} = {};

export function setExtraFunction(canvas: any = {}) {
  canvas = canvas;
}

function requestAnimationFrame(fn: FrameRequestCallback) {
  if (canvas?.requestAnimationFrame) {
    return canvas.requestAnimationFrame(fn);
  }
  const method =
    typeof window === 'object' && window.requestAnimationFrame
      ? window.requestAnimationFrame
      : (f) => {
          return setTimeout(f, 16);
        };
  return method(fn);
}

function clearAnimationFrame(handler: number) {
  if (canvas?.clearAnimationFrame) {
    return canvas.clearAnimationFrame(handler);
  }
  const method = typeof window === 'object' && window.cancelAnimationFrame ? window.cancelAnimationFrame : clearTimeout;
  return method(handler);
}

export { requestAnimationFrame, clearAnimationFrame };
