import { GeometryAABBUpdater } from '@antv/g';
import { singleton } from 'mana-syringe';
import type { ParsedMeshStyleProps } from './Mesh';
import { Mesh } from './Mesh';

@singleton({ token: { token: GeometryAABBUpdater, named: Mesh.tag } })
export class MeshUpdater implements GeometryAABBUpdater<ParsedMeshStyleProps> {
  update(parsedStyle: ParsedMeshStyleProps) {
    const { geometry, x, y, z } = parsedStyle;

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
      x: (x && x.value) || 0,
      y: (y && y.value) || 0,
      z: (z && z.value) || 0,
    };
  }
}
