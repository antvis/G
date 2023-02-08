function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const createContext = (
  title = '',
  { width = '300px', height = '225px' } = {},
  type = '2d',
) => {
  if (title) {
    const titleEl = document.createElement('p');
    titleEl.innerText = title + ':';
    titleEl.style.fontSize = '12px';
    document.body.appendChild(titleEl);
  }
  const canvasEl = document.createElement('canvas');
  canvasEl.style.display = 'block';
  canvasEl.style.width = width;
  canvasEl.style.height = height;
  document.body.appendChild(canvasEl);
  const context = canvasEl.getContext(type);
  return context as CanvasRenderingContext2D;
};

const gestureSimulator = (
  dom: HTMLElement,
  eventType: string,
  option: { x: number; y: number; identifier: number },
) => {
  const { top, left } = dom.getBoundingClientRect();
  const screenTop = window.screenTop;
  const screenLeft = window.screenLeft;
  const { x, y, identifier = 0 } = option;
  const clientX = left + x;
  const clientY = top + y;
  const event = new Touch({
    clientX,
    clientY,
    pageX: clientX,
    pageY: clientX,
    force: 1,
    identifier,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    screenX: screenLeft + clientX,
    screenY: screenTop + clientY,
    target: dom,
  });

  const touchList = [event];

  const touchEvent = new TouchEvent(eventType, {
    changedTouches: touchList,
    targetTouches: touchList,
    touches: touchList,
  });

  dom.dispatchEvent(touchEvent);
};

export { createContext, delay, gestureSimulator };
