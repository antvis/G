// import DOMMatrix from 'geometry-interfaces/DOMMatrix';
import type { CSSNumericValue } from './CSSNumericValue';
import { CSSTransformComponent } from './CSSTransformComponent';
// import { UnitType } from './types';

/**
 * Represents a translation value in a CSSTransformValue
 * used for properties like "transform".
 *
 * @see https://drafts.css-houdini.org/css-typed-om/#csstranslate
 */
export class CSSTranslate extends CSSTransformComponent {
  constructor(
    public x: CSSNumericValue,
    public y: CSSNumericValue,
    public z: CSSNumericValue,
    is2D: boolean,
  ) {
    super(is2D);
  }

  toMatrix(): globalThis.DOMMatrix {
    // const x = this.x.to(UnitType.kPixels);
    // const y = this.y.to(UnitType.kPixels);
    // const z = this.z.to(UnitType.kPixels);

    // let matrix: DOMMatrix;
    // if (this.is2D) {
    //   matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
    //   matrix.translateSelf(x.value, y.value);
    // } else {
    //   matrix = new DOMMatrix();
    //   matrix.translateSelf(x.value, y.value, z.value);
    // }
    // return matrix;
    return null;
  }
}
