function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const createContext = (title = '', { width = '300px', height = '225px' } = {}, type = '2d') => {
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

export { createContext, delay };
