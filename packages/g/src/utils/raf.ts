function requestAnimationFrame(fn: FrameRequestCallback) {
  const method =
    typeof window === 'object' && window.requestAnimationFrame
      ? window.requestAnimationFrame
      : // eslint-disable-next-line @typescript-eslint/ban-types
        (f: Function) => {
          return setTimeout(f, 16);
        };
  return method(fn);
}

function cancelAnimationFrame(handler: number) {
  const method =
    typeof window === 'object' && window.cancelAnimationFrame
      ? window.cancelAnimationFrame
      : clearTimeout;
  return method(handler);
}

export { requestAnimationFrame, cancelAnimationFrame };
