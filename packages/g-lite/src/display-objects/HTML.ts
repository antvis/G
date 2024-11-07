import { mat4 } from 'gl-matrix';
import type { DisplayObjectConfig } from '../dom';
import { AABB } from '../shapes';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface HTMLStyleProps extends BaseStyleProps {
  x?: number | string;
  y?: number | string;
  innerHTML: string | HTMLElement;
  width?: number | string;
  height?: number | string;
}

export interface ParsedHTMLStyleProps extends ParsedBaseStyleProps {
  x: number;
  y: number;
  $el: HTMLElement;
  innerHTML: string | HTMLElement;
  width: number;
  height: number;
}

/**
 * HTML container
 * @see https://github.com/pmndrs/drei#html
 */
export class HTML extends DisplayObject<HTMLStyleProps, ParsedHTMLStyleProps> {
  static PARSED_STYLE_LIST: Set<string> = new Set([
    ...DisplayObject.PARSED_STYLE_LIST,
    'x',
    'y',
    '$el',
    'innerHTML',
    'width',
    'height',
  ]);

  constructor({ style, ...rest }: DisplayObjectConfig<HTMLStyleProps> = {}) {
    super({
      type: Shape.HTML,
      style,
      ...rest,
    });

    this.cullable.enable = false;
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
   *
   * ! The calculation logic of the html element should be consistent with that of the canvas element
   */
  // getBoundingClientRect(): Rectangle {
  //   if (this.parsedStyle.$el) {
  //     return this.parsedStyle.$el.getBoundingClientRect();
  //   } else {
  //     const { x, y, width, height } = this.parsedStyle;
  //     return new Rectangle(x, y, width, height);
  //   }
  // }

  getClientRects() {
    return [this.getBoundingClientRect()];
  }

  // getBounds() {
  //   const clientRect = this.getBoundingClientRect();
  //   // calc context's offset
  //   // @ts-ignore
  //   const canvasRect = this.ownerDocument?.defaultView
  //     ?.getContextService()
  //     .getBoundingClientRect();

  //   const aabb = new AABB();
  //   const minX = clientRect.left - (canvasRect?.left || 0);
  //   const minY = clientRect.top - (canvasRect?.top || 0);
  //   aabb.setMinMax(
  //     [minX, minY, 0],
  //     [minX + clientRect.width, minY + clientRect.height, 0],
  //   );
  //   return aabb;
  // }

  getLocalBounds() {
    if (this.parentNode) {
      const parentInvert = mat4.invert(
        mat4.create(),
        (this.parentNode as DisplayObject).getWorldTransform(),
      );
      const bounds = this.getBounds();

      if (!AABB.isEmpty(bounds)) {
        const localBounds = new AABB();
        localBounds.setFromTransformedAABB(bounds, parentInvert);
        return localBounds;
      }
    }

    return this.getBounds();
  }
}
