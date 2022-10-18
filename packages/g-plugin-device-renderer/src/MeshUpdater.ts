import type { GeometryAABBUpdater } from '@antv/g-lite';
import type { ParsedMeshStyleProps } from './Mesh';
export class MeshUpdater implements GeometryAABBUpdater<ParsedMeshStyleProps> {
  update(parsedStyle: ParsedMeshStyleProps) {
    const { geometry } = parsedStyle;

    geometry.computeBoundingBox();
    // const minX = Math.min(x1, x2);
    // const maxX = Math.max(x1, x2);
    // const minY = Math.min(y1, y2);
    // const maxY = Math.max(y1, y2);

    // const width = maxX - minX;
    // const height = maxY - minY;

    return {
      width: 0,
      height: 0,
      depth: 0,
    };
  }
}
