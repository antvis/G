function getStyle(el, property) {
  if (el.currentStyle) {
    return el.currentStyle[property];
  }
  if (window && window.document) {
    return document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
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

function isCanvasElement(el) {
  if (!el || typeof el !== 'object') return false;
  if (el.nodeType === 1 && el.nodeName) {
    // HTMLCanvasElement
    return true;
  }
  // CanvasElement
  return !!el.isCanvasElement;
}

export { getWidth, getHeight, isCanvasElement };
