import type { Nested, ParenLess } from './types';
import { CSSStyleValue, CSSStyleValueType } from './CSSStyleValue';
import type { CSSTransformComponent } from './CSSTransformComponent';

/**
 * represents transform-list values as used by the CSS transform property.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSTransformValue
 */
export class CSSTransformValue extends CSSStyleValue {
  /**
   * whether the transform is 2D or 3D
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSTransformValue/is2D
   */
  readonly is2D: boolean;

  /**
   * the number of transform components in the list.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSTransformValue/length
   */
  readonly length: number;

  constructor(private transforms: CSSTransformComponent[]) {
    super();
    this.is2D = transforms.every((transform) => transform.is2D);
    this.length = transforms.length;
  }

  clone() {
    return new CSSTransformValue(this.transforms);
  }

  getType() {
    return CSSStyleValueType.kTransformType;
  }

  buildCSSText(n: Nested, p: ParenLess, result: string): string {
    const text = '';

    return (result += text);
  }

  /**
   * returns a DOMMatrix object
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSTransformValue/toMatrix
   */
  toMatrix() {}
}
