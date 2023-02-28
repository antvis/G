import { mat4 } from 'gl-matrix';
import type { CSSUnitValue } from '../css';
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
  x: CSSUnitValue;
  y: CSSUnitValue;
  $el: HTMLElement;
  innerHTML: string | HTMLElement;
  width: CSSUnitValue;
  height: CSSUnitValue;
}

/**
 * HTML container
 * @see https://github.com/pmndrs/drei#html
 */
export class HTML extends DisplayObject<HTMLStyleProps, ParsedHTMLStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<HTMLStyleProps> = {}) {
    super({
      type: Shape.HTML,
      style: {
        x: '',
        y: '',
        width: 'auto',
        height: 'auto',
        innerHTML: '',
        ...style,
      },
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
    // @ts-ignore
    const canvasRect = this.ownerDocument?.defaultView
      ?.getContextService()
      .getBoundingClientRect();
    if (canvasRect) {
      const minX = clientRect.left - canvasRect.left;
      const minY = clientRect.top - canvasRect.top;

      const aabb = new AABB();
      // aabb.setMinMax(
      //   vec3.fromValues(minX, minY, 0),
      //   vec3.fromValues(minX + clientRect.width, minY + clientRect.height, 0),
      // );
      aabb.setMinMax(
        [minX, minY, 0],
        [minX + clientRect.width, minY + clientRect.height, 0],
      );

      return aabb;
    }
    return null;
  }

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
