import { DisplayObject, ShapeCfg } from '@antv/g';
import { SHAPE_3D } from './types';

export class Grid extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE_3D.Grid,
      attrs: {
        ...attrs,
      },
      ...rest,
    });
  }
}
