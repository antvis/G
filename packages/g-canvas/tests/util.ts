export function simulateMouseEvent(dom, type, cfg) {
  const event = new MouseEvent(type, cfg);
  dom.dispatchEvent(event);
}

export function getClientPoint(canvas, x, y) {
  const point = canvas.getClientByPoint(x, y);
  return {
    clientX: point.x,
    clientY: point.y,
  };
}
