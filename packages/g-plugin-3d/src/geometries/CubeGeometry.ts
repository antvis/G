import { Mesh, VertexAttributeLocation } from '@antv/g-plugin-webgl-renderer';
import { vec3 } from 'gl-matrix';
import { ProceduralGeometry, ProceduralGeometryAttributeLocation } from './ProceduralGeometry';

const primitiveUv1Padding = 4.0 / 64;
const primitiveUv1PaddingScale = 1.0 - primitiveUv1Padding * 2;

export interface CubeGeometryProps {
  height: number;
  width: number;
  depth: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
}

export class CubeGeometry extends ProceduralGeometry<CubeGeometryProps> {
  createTopology(mesh: Mesh<CubeGeometryProps>) {
    const {
      widthSegments = 1,
      heightSegments = 1,
      depthSegments = 1,
      height = 0,
      width = 0,
      depth = 0,
    } = mesh.style;
    const ws = widthSegments;
    const hs = heightSegments;
    const ds = depthSegments;
    const hex = width / 2;
    const hey = height / 2;
    const hez = depth / 2;

    const corners = [
      vec3.fromValues(-hex, -hey, hez),
      vec3.fromValues(hex, -hey, hez),
      vec3.fromValues(hex, hey, hez),
      vec3.fromValues(-hex, hey, hez),
      vec3.fromValues(hex, -hey, -hez),
      vec3.fromValues(-hex, -hey, -hez),
      vec3.fromValues(-hex, hey, -hez),
      vec3.fromValues(hex, hey, -hez),
    ];

    const faceAxes = [
      [0, 1, 3], // FRONT
      [4, 5, 7], // BACK
      [3, 2, 6], // TOP
      [1, 0, 4], // BOTTOM
      [1, 4, 2], // RIGHT
      [5, 0, 6], // LEFT
    ];

    const faceNormals = [
      [0, 0, 1], // FRONT
      [0, 0, -1], // BACK
      [0, 1, 0], // TOP
      [0, -1, 0], // BOTTOM
      [1, 0, 0], // RIGHT
      [-1, 0, 0], // LEFT
    ];

    const sides = {
      FRONT: 0,
      BACK: 1,
      TOP: 2,
      BOTTOM: 3,
      RIGHT: 4,
      LEFT: 5,
    };

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const uvs1: number[] = [];
    const indices: number[] = [];
    let vcounter = 0;

    const generateFace = (side: number, uSegments: number, vSegments: number) => {
      let u: number;
      let v: number;
      let i: number;
      let j: number;

      for (i = 0; i <= uSegments; i++) {
        for (j = 0; j <= vSegments; j++) {
          const temp1 = vec3.create();
          const temp2 = vec3.create();
          const temp3 = vec3.create();
          const r = vec3.create();
          vec3.lerp(temp1, corners[faceAxes[side][0]], corners[faceAxes[side][1]], i / uSegments);
          vec3.lerp(temp2, corners[faceAxes[side][0]], corners[faceAxes[side][2]], j / vSegments);
          vec3.sub(temp3, temp2, corners[faceAxes[side][0]]);
          vec3.add(r, temp1, temp3);
          u = i / uSegments;
          v = j / vSegments;

          positions.push(r[0], r[1], r[2]);
          normals.push(faceNormals[side][0], faceNormals[side][1], faceNormals[side][2]);
          uvs.push(u, 1.0 - v);
          // pack as 3x2
          // 1/3 will be empty, but it's either that or stretched pixels
          // TODO: generate non-rectangular lightMaps, so we could use space without stretching
          u /= 3;
          v /= 3;
          u = u * primitiveUv1PaddingScale + primitiveUv1Padding;
          v = v * primitiveUv1PaddingScale + primitiveUv1Padding;
          u += (side % 3) / 3;
          v += Math.floor(side / 3) / 3;
          uvs1.push(u, 1.0 - v);

          if (i < uSegments && j < vSegments) {
            indices.push(vcounter + vSegments + 1, vcounter + 1, vcounter);
            indices.push(vcounter + vSegments + 1, vcounter + vSegments + 2, vcounter + 1);
          }

          vcounter++;
        }
      }
    };

    generateFace(sides.FRONT, ws, hs);
    generateFace(sides.BACK, ws, hs);
    generateFace(sides.TOP, ws, ds);
    generateFace(sides.BOTTOM, ws, ds);
    generateFace(sides.RIGHT, ds, hs);
    generateFace(sides.LEFT, ds, hs);

    return {
      indices: indices,
      positions: positions,
      normals: normals,
      uvs: uvs,
      uv1s: uvs1,
    };
  }

  update<Key extends keyof CubeGeometryProps>(
    index: number,
    mesh: Mesh,
    name: Key,
    value: CubeGeometryProps[Key],
  ) {
    if (name === 'width' || name === 'height' || name === 'depth') {
      const { positions } = this.createTopology(mesh);

      const p = Float32Array.from(positions);
      this.applyMa4Position(this.flipYMatrix, p);

      return [
        {
          bufferIndex: ProceduralGeometryAttributeLocation.POSITION,
          location: VertexAttributeLocation.POSITION,
          data: p,
        },
      ];
    }

    return [];
  }
}
