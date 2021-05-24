import { DisplayObject } from './DisplayObject';
import { SHAPE, ShapeCfg } from './types';

/**
 * @see https://yuque.antfin-inc.com/antv/czqvg5/pgqipg
 */
export class CustomElement extends DisplayObject {
  /**
   * shadow root
   */
  private root = new DisplayObject();

  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE.Custom,
      attrs: {
        ...attrs,
      },
      ...rest,
    });
  }
}
