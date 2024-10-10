import type { GeometryAABBUpdater } from '@antv/g-lite';
import type { ParsedMeshStyleProps } from './Mesh';

export class MeshUpdater implements GeometryAABBUpdater<ParsedMeshStyleProps> {
  update(parsedStyle: ParsedMeshStyleProps) {
    const { x = 0, y = 0, z = 0, geometry } = parsedStyle;

    const aabb = geometry.computeBoundingBox();

    return {
      cx: x,
      cy: y,
      cz: z,
      hwidth: aabb.halfExtents[0],
      hheight: aabb.halfExtents[1],
      hdepth: aabb.halfExtents[2],
    };
  }
}
