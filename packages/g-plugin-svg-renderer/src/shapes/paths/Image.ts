import { ParsedImageStyleProps } from '@antv/g';
import { isString } from '@antv/util';
import { ElementRenderer } from '.';
import { injectable } from 'inversify';

@injectable()
export class ImageRenderer implements ElementRenderer<ParsedImageStyleProps> {
  dependencies = ['img', 'width', 'height'];

  apply($el: SVGElement, attributes: ParsedImageStyleProps) {
    const { img = '', width = 0, height = 0 } = attributes;

    $el.setAttribute('x', '0');
    $el.setAttribute('y', '0');

    if (isString(img)) {
      $el.setAttribute('href', img);
    } else if (img instanceof Image) {
      if (!width) {
        $el.setAttribute('width', `${img.width}`);
        // TODO: set renderable.boundsDirty
        // this.attr('width', img.width);
      }
      if (!height) {
        $el.setAttribute('height', `${img.height}`);
        // this.attr('height', img.height);
      }
      $el.setAttribute('href', img.src);
    } else if (
      // @ts-ignore
      img instanceof HTMLElement &&
      isString((img as HTMLElement).nodeName) &&
      (img as HTMLElement).nodeName.toUpperCase() === 'CANVAS'
    ) {
      $el.setAttribute('href', (img as HTMLCanvasElement).toDataURL());
      // @ts-ignore
    } else if (img instanceof ImageData) {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      // @ts-ignore
      canvas.setAttribute('width', `${img.width}`);
      // @ts-ignore
      canvas.setAttribute('height', `${img.height}`);
      const context = canvas.getContext('2d');
      if (context) {
        context.putImageData(img, 0, 0);
        if (!width) {
          // @ts-ignore
          $el.setAttribute('width', `${img.width}`);
          // this.attr('width', img.width);
        }
        if (!height) {
          // @ts-ignore
          $el.setAttribute('height', `${img.height}`);
          // this.attr('height', img.height);
        }
        $el.setAttribute('href', canvas.toDataURL());
      }
    }
  }
}
