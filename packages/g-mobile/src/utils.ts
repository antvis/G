function getStyle(el, property) {
  if (el.currentStyle) {
    return el.currentStyle[property];
  }
  if (window && window.document) {
    document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
  }
}

function getWidth(el) {
  let width = getStyle(el, 'width');
  if (width === 'auto') {
    width = el.offsetWidth;
  }
  return parseFloat(width);
}

function getHeight(el) {
  let height = getStyle(el, 'height');
  if (height === 'auto') {
    height = el.offsetHeight;
  }
  return parseFloat(height);
}

function normContext(ctx: RenderingContext, devicePixelRatio: number) {
  ctx.canvas.width = getWidth(ctx.canvas) * devicePixelRatio || ctx.canvas.width || 0;
  ctx.canvas.height = getHeight(ctx.canvas) * devicePixelRatio || ctx.canvas.height || 0;
  return ctx;
}

export { normContext };
