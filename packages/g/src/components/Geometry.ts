import type { AABB } from '../shapes';

export class Geometry {
  static tag = 'c-geometry';

  /**
   * excluding all children
   */
  contentBounds: AABB | undefined;

  /**
   * including extra rendering effects, eg. shadowBlur filters(drop-shadow, blur)
   */
  renderBounds: AABB | undefined;

  /**
   * account for `hitArea` & `increasedLineWidthForHitTesting`
   */
  // hitAreaBounds: AABB | undefined;
}
