export class ElementSVG {
  static tag = 'c-svg-element';

  /**
   * basic element, eg. <circle>|<ellipse>
   */
  $el: SVGElement | null;

  /**
   * group wrapper for basic element, eg. <group><circle /></group>.
   * if current element is <group>, same as `$el`
   */
  $groupEl: SVGElement | null;

  /**
   * hitArea:
   * $groupEl -> $el
   *          -> $hitTestingEl
   */
  $hitTestingEl: SVGElement | null;
}
