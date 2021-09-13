import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import { GeometryAABBUpdater, AABB } from '@antv/g';
import { ParsedCubeStyleProps } from '../Cube';

@injectable()
export class CubeUpdater implements GeometryAABBUpdater<ParsedCubeStyleProps> {
  dependencies = ['height', 'width', 'depth', 'anchor'];

  // @ts-ignore
  update(attributes: ParsedCubeStyleProps) {
    const { height = 0, width = 0, depth = 0 } = attributes;

    return {
      width,
      height,
      depth,
    };
  }
}
