const cache = {};

export function setExtraFunction(extraData: any = {}) {
  cache['requestAnimationFrame'] = extraData['requestAnimationFrame'];
  cache['clearAnimationFrame'] = extraData['cancelAnimationFrame'];
}

function requestAnimationFrame(fn: FrameRequestCallback) {
  if (cache['requestAnimationFrame']) {
    return cache['requestAnimationFrame'](fn);
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
  if (cache['clearAnimationFrame']) {
    return cache['clearAnimationFrame'](handler);
  }
  const method = typeof window === 'object' && window.cancelAnimationFrame ? window.cancelAnimationFrame : clearTimeout;
  return method(handler);
}

export { requestAnimationFrame, clearAnimationFrame };
