import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';
import { Cullable } from '../components';
import { AABB } from '../shapes';
import { mat4, vec3 } from 'gl-matrix';

export interface HTMLStyleProps extends BaseStyleProps {
  innerHTML: string | HTMLElement;
  className?: string | string[];
  style?: string;
}

export interface ParsedHTMLStyleProps extends ParsedBaseStyleProps {
  $el: HTMLElement;
}

/**
 * HTML container
 * @see https://github.com/pmndrs/drei#html
 */
export class HTML extends DisplayObject<HTMLStyleProps, ParsedHTMLStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<HTMLStyleProps>) {
    super({
      type: SHAPE.HTML,
      style: {
        innerHTML: '',
        className: '',
        style: '',
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        anchor: [0, 0],
        ...style,
      },
      ...rest,
    });

    const cullable = this.getEntity().getComponent(Cullable);
    cullable.enable = false;
  }

  /**
   * return wrapper HTMLElement
   * * <div> in g-webgl/canvas
   * * <foreignObject> in g-svg
   */
  getDomElement() {
    return this.parsedStyle.$el;
  }

  /**
   * override with $el.getBoundingClientRect
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
   */
  getBoundingClientRect() {
    return this.parsedStyle.$el.getBoundingClientRect();
  }

  getClientRects() {
    return [this.getBoundingClientRect()];
  }

  getBounds() {
    const clientRect = this.getBoundingClientRect();
    // calc context's offset
    const canvasRect = this.ownerDocument?.defaultView.getContextService().getBoundingClientRect();
    if (canvasRect) {
      const minX = clientRect.left - canvasRect.left;
      const minY = clientRect.top - canvasRect.top;

      const aabb = new AABB();
      aabb.setMinMax(
        vec3.fromValues(minX, minY, 0),
        vec3.fromValues(minX + clientRect.width, minY + clientRect.height, 0),
      );

      return aabb;
    }
    return null;
  }

  getLocalBounds() {
    if (this.parent) {
      const parentInvert = mat4.invert(mat4.create(), this.parent.getWorldTransform());
      const bounds = this.getBounds();

      if (bounds) {
        const localBounds = new AABB();
        localBounds.setFromTransformedAABB(bounds, parentInvert);
        return localBounds;
      }
    }

    return this.getBounds();
  }
}
