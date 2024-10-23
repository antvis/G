import type { ParsedImageStyleProps } from '@antv/g-lite';
import { isString } from '@antv/util';

export function updateImageElementAttribute(
  $el: SVGElement,
  parsedStyle: ParsedImageStyleProps,
) {
  const { src = '', x = 0, y = 0, width, height } = parsedStyle;

  $el.setAttribute('x', `${x}`);
  $el.setAttribute('y', `${y}`);

  if (isString(src)) {
    $el.setAttribute('href', src);
  } else if (src instanceof Image) {
    if (!width) {
      $el.setAttribute('width', `${src.width}`);
    }
    if (!height) {
      $el.setAttribute('height', `${src.height}`);
    }
    $el.setAttribute('href', src.src);
  } else if (
    // @ts-ignore
    src instanceof HTMLElement &&
    isString((src as HTMLElement).nodeName) &&
    (src as HTMLElement).nodeName.toUpperCase() === 'CANVAS'
  ) {
    $el.setAttribute('href', (src as HTMLCanvasElement).toDataURL());
    // @ts-ignore
  } else if (src instanceof ImageData) {
    const canvas = document.createElement('canvas');
    // @ts-ignore
    canvas.setAttribute('width', `${src.width}`);
    // @ts-ignore
    canvas.setAttribute('height', `${src.height}`);
    const context = canvas.getContext('2d');
    if (context) {
      context.putImageData(src, 0, 0);
      if (!width) {
        // @ts-ignore
        $el.setAttribute('width', `${src.width}`);
      }
      if (!height) {
        // @ts-ignore
        $el.setAttribute('height', `${src.height}`);
      }
      $el.setAttribute('href', canvas.toDataURL());
    }
  }
}
