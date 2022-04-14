function isCanvasElement(el) {
  if (!el || typeof el !== 'object') return false;
  if (el.nodeType === 1 && el.nodeName) {
    // HTMLCanvasElement
    return true;
  }
  // CanvasElement
  return !!el.isCanvasElement;
}

export { isCanvasElement };
