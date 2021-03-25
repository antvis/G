import { isBrowser } from './browser';

const PX_SUFFIX = 'px';
export function setDOMSize($el: HTMLElement, width: number, height: number) {
  if (isBrowser) {
    $el.style.width = width + PX_SUFFIX;
    $el.style.height = height + PX_SUFFIX;
  }
}

export function getEventPosition($canvas: HTMLCanvasElement, ev: Event) {
  let clientInfo: MouseEvent | Touch = ev as MouseEvent;
  if ((ev as TouchEvent).touches) {
    if (ev.type === 'touchend') {
      clientInfo = (ev as TouchEvent).changedTouches[0];
    } else {
      clientInfo = (ev as TouchEvent).touches[0];
    }
  }
  const clientX = clientInfo.clientX;
  const clientY = clientInfo.clientY;
  const bbox = $canvas.getBoundingClientRect();

  return {
    clientX,
    clientY,
    x: clientX - bbox.left,
    y: clientY - bbox.top,
  };
}
