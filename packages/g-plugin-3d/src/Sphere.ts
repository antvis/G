import { DisplayObject, ShapeCfg } from '@antv/g';
import { SHAPE_3D } from './types';

export class Sphere extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE_3D.Sphere,
      attrs: {
        ...attrs,
      },
      ...rest,
    });
  }
}
