import { Mesh } from '@antv/g-plugin-webgl-renderer';
import { ProceduralGeometry } from './ProceduralGeometry';

export interface SphereGeometryProps {
  radius: number;
  latitudeBands?: number;
  longitudeBands?: number;
}

export class SphereGeometry extends ProceduralGeometry<SphereGeometryProps> {
  createTopology(meshes: Mesh<SphereGeometryProps>[]) {
    const positionsAll: number[] = [];
    const normalsAll: number[] = [];
    const uvsAll: number[] = [];
    const indicesAll: number[] = [];

    let lon: number;
    let lat: number;
    let theta: number;
    let sinTheta: number;
    let cosTheta: number;
    let phi: number;
    let sinPhi: number;
    let cosPhi: number;
    let first: number;
    let second: number;
    let x: number;
    let y: number;
    let z: number;
    let u: number;
    let v: number;

    let indicesStart = 0;
    let vertexCountPerInstance = 0;

    meshes
      .map((mesh) => mesh.style)
      .forEach((props) => {
        const { radius = 0.5, latitudeBands = 16, longitudeBands = 16 } = props;

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        for (lat = 0; lat <= latitudeBands; lat++) {
          theta = (lat * Math.PI) / latitudeBands;
          sinTheta = Math.sin(theta);
          cosTheta = Math.cos(theta);

          for (lon = 0; lon <= longitudeBands; lon++) {
            // Sweep the sphere from the positive Z axis to match a 3DS Max sphere
            phi = (lon * 2 * Math.PI) / longitudeBands - Math.PI / 2.0;
            sinPhi = Math.sin(phi);
            cosPhi = Math.cos(phi);

            x = cosPhi * sinTheta;
            y = cosTheta;
            z = sinPhi * sinTheta;
            u = 1.0 - lon / longitudeBands;
            v = 1.0 - lat / latitudeBands;

            positions.push(x * radius, y * radius, z * radius);
            normals.push(x, y, z);
            uvs.push(u, 1.0 - v);
          }
        }

        for (lat = 0; lat < latitudeBands; ++lat) {
          for (lon = 0; lon < longitudeBands; ++lon) {
            first = lat * (longitudeBands + 1) + lon;
            second = first + longitudeBands + 1;

            indices.push(first + 1 + indicesStart, second + indicesStart, first + indicesStart);
            indices.push(
              first + 1 + indicesStart,
              second + 1 + indicesStart,
              second + indicesStart,
            );
          }
        }

        vertexCountPerInstance = indices.length;

        indicesStart += vertexCountPerInstance;

        positionsAll.push(...positions);
        normalsAll.push(...normals);
        uvsAll.push(...uvs);
        indicesAll.push(...indices);
      });

    return {
      indices: indicesAll,
      positions: positionsAll,
      normals: normalsAll,
      uvs: uvsAll,
      uvs1: uvsAll,
      vertexCountPerInstance,
    };
  }
}
