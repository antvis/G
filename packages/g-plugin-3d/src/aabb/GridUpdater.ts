import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import { GeometryAABBUpdater, AABB } from '@antv/g';
import { GridStyleProps } from '../Grid';

@injectable()
// @ts-ignore
export class GridUpdater implements GeometryAABBUpdater<GridStyleProps> {
  dependencies = ['width', 'height', 'anchor'];

  // @ts-ignore
  update(attributes: GridStyleProps, aabb: AABB) {
    const { width = 0, height = 0 } = attributes;

    return {
      width,
      height,
    };
  }
}
