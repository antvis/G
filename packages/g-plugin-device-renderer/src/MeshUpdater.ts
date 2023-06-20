import type { GeometryAABBUpdater } from '@antv/g-lite';
import type { ParsedMeshStyleProps } from './Mesh';
export class MeshUpdater implements GeometryAABBUpdater<ParsedMeshStyleProps> {
  update(parsedStyle: ParsedMeshStyleProps) {
    const { geometry } = parsedStyle;

    const aabb = geometry.computeBoundingBox();
    const max = aabb.getMax();
    const min = aabb.getMin();

    const width = max[0] - min[0];
    const height = max[1] - min[1];
    const depth = max[2] - min[2];

    return {
      width,
      height,
      depth,
    };
  }
}
