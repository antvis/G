import { Mesh, VertexAttributeLocation } from '@antv/g-plugin-webgl-renderer';
import { ProceduralGeometry, ProceduralGeometryAttributeLocation } from './ProceduralGeometry';

export interface PlaneGeometryProps {
  width: number;
  depth: number;
  widthSegments?: number;
  depthSegments?: number;
}

export class PlaneGeometry extends ProceduralGeometry<PlaneGeometryProps> {
  createTopology(mesh: Mesh<PlaneGeometryProps>) {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const { widthSegments = 5, depthSegments = 5, width = 1, depth = 1 } = mesh.style;

    const he = { x: width / 2, y: depth / 2 };
    const ws = widthSegments;
    const ls = depthSegments;

    // Variable declarations
    let i: number;
    let j: number;
    let x: number;
    let y: number;
    let z: number;
    let u: number;
    let v: number;

    // Generate plane as follows (assigned UVs denoted at corners):
    // (0,1)x---------x(1,1)
    //      |         |
    //      |         |
    //      |    O--X |length
    //      |    |    |
    //      |    Z    |
    // (0,0)x---------x(1,0)
    // width
    let vcounter = 0;

    for (i = 0; i <= ws; i++) {
      for (j = 0; j <= ls; j++) {
        x = -he.x + (2.0 * he.x * i) / ws;
        y = 0.0;
        z = -(-he.y + (2.0 * he.y * j) / ls);
        u = i / ws;
        v = j / ls;

        positions.push(x, y, z);
        normals.push(0.0, 1.0, 0.0);
        uvs.push(u, 1.0 - v);

        if (i < ws && j < ls) {
          indices.push(vcounter + ls + 1, vcounter + 1, vcounter);
          indices.push(vcounter + ls + 1, vcounter + ls + 2, vcounter + 1);
        }

        vcounter++;
      }
    }

    return {
      indices,
      positions,
      normals,
      uvs,
      uv1s: uvs,
    };
  }

  update<Key extends keyof PlaneGeometryProps>(
    index: number,
    mesh: Mesh,
    name: Key,
    value: PlaneGeometryProps[Key],
  ) {
    if (name === 'width' || name === 'depth') {
      const { positions } = this.createTopology(mesh);

      const p = Float32Array.from(positions);
      this.applyMa4Position(this.flipYMatrix, p);

      return [
        {
          bufferIndex: ProceduralGeometryAttributeLocation.POSITION,
          location: VertexAttributeLocation.MAX,
          data: p,
        },
      ];
    }

    return [];
  }
}
