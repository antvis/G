import { Entity } from '@antv/g-ecs';
import { SceneGraphNode } from '@antv/g';
import { isString } from '@antv/util';
import { ElementRenderer } from '.';
import { injectable } from 'inversify';

@injectable()
export class ImageRenderer implements ElementRenderer {
  apply($el: SVGElement, entity: Entity) {
    const { img, width = 0, height = 0, anchor = [0, 0] } = entity.getComponent(SceneGraphNode).attributes;

    // set anchor
    $el.setAttribute('x', `${-anchor[0] * width}`);
    $el.setAttribute('y', `${-anchor[1] * height}`);

    if (isString(img)) {
      $el.setAttribute('href', img);
    } else if (img instanceof Image) {
      if (!width) {
        $el.setAttribute('width', `${img.width}`);
        // TODO: set renderable.aabbDirty
        // this.attr('width', img.width);
      }
      if (!height) {
        $el.setAttribute('height', `${img.height}`);
        // this.attr('height', img.height);
      }
      $el.setAttribute('href', img.src);
    } else if (img instanceof HTMLElement && isString(img.nodeName) && img.nodeName.toUpperCase() === 'CANVAS') {
      $el.setAttribute('href', (img as HTMLCanvasElement).toDataURL());
    } else if (img instanceof ImageData) {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      canvas.setAttribute('width', `${img.width}`);
      canvas.setAttribute('height', `${img.height}`);
      const context = canvas.getContext('2d');
      if (context) {
        context.putImageData(img, 0, 0);
        if (!width) {
          $el.setAttribute('width', `${img.width}`);
          // this.attr('width', img.width);
        }
        if (!height) {
          $el.setAttribute('height', `${img.height}`);
          // this.attr('height', img.height);
        }
        $el.setAttribute('href', canvas.toDataURL());
      }
    }
  }
}
