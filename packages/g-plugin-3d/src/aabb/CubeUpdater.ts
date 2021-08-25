import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import { GeometryAABBUpdater, AABB } from '@antv/g';
import { CubeStyleProps } from '../Cube';

@injectable()
export class CubeUpdater implements GeometryAABBUpdater<CubeStyleProps> {
  dependencies = ['height', 'width', 'depth', 'anchor'];

  update(attributes: CubeStyleProps) {
    const { height = 0, width = 0, depth = 0 } = attributes;

    return {
      width,
      height,
      depth,
    };
  }
}
