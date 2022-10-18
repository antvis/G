export class ElementSVG {
  static tag = 'c-svg-element';

  /**
   * basic element, eg. <circle>|<ellipse>
   */
  $el: SVGElement | null;

  /**
   * group wrapper for basic element, eg. <g><circle /></g>.
   * if current element is <g>, same as `$el`
   */
  $groupEl: SVGElement | null;

  /**
   * hitArea:
   * $groupEl -> $el
   *          -> $hitTestingEl
   */
  $hitTestingEl: SVGElement | null;
}
