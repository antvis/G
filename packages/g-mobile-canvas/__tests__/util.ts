function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const createContext = (title = '', { width = 300, height = 300 } = {}, type = '2d') => {
  if (title) {
    const titleEl = document.createElement('p');
    titleEl.innerText = title + ':';
    titleEl.style.fontSize = '12px';
    document.body.appendChild(titleEl);
  }

  const $canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio;
  $canvas.width = dpr * width;
  $canvas.height = dpr * height;
  $canvas.style.width = `${width}px`;
  $canvas.style.height = `${height}px`;
  document.body.appendChild($canvas);

  return $canvas.getContext(type) as CanvasRenderingContext2D;
};

export { createContext, delay };
