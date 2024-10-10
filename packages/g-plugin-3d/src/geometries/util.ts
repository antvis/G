import { vec3 } from 'gl-matrix';

export const primitiveUv1Padding = 4.0 / 64;
export const primitiveUv1PaddingScale = 1.0 - primitiveUv1Padding * 2;

export function createConeData(
  baseRadius: number,
  peakRadius: number,
  height: number,
  heightSegments: number,
  capSegments: number,
  roundedCaps: boolean,
) {
  // Variable declarations
  let i: number;
  let j: number;
  let x: number;
  let y: number;
  let z: number;
  let u: number;
  let v: number;
  const pos = vec3.create();
  const bottomToTop = vec3.create();
  const norm = vec3.create();
  let top: vec3;
  let bottom: vec3;
  let tangent: vec3;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const uvs1: number[] = [];
  const indices: number[] = [];

  let theta: number;
  let cosTheta: number;
  let sinTheta: number;
  let phi: number;
  let sinPhi: number;
  let cosPhi: number;
  let first: number;
  let second: number;
  let third: number;
  let fourth: number;
  let offset: number;

  // Define the body of the cone/cylinder
  if (height > 0) {
    for (i = 0; i <= heightSegments; i++) {
      for (j = 0; j <= capSegments; j++) {
        // Sweep the cone body from the positive Y axis to match a 3DS Max cone/cylinder
        theta = (j / capSegments) * 2.0 * Math.PI - Math.PI;
        sinTheta = Math.sin(theta);
        cosTheta = Math.cos(theta);
        bottom = vec3.fromValues(
          sinTheta * baseRadius,
          -height / 2.0,
          cosTheta * baseRadius,
        );
        top = vec3.fromValues(
          sinTheta * peakRadius,
          height / 2.0,
          cosTheta * peakRadius,
        );
        vec3.lerp(pos, bottom, top, i / heightSegments);
        vec3.normalize(bottomToTop, vec3.sub(bottomToTop, top, bottom));
        // bottomToTop.sub2(top, bottom).normalize();
        tangent = vec3.fromValues(cosTheta, 0.0, -sinTheta);
        vec3.normalize(norm, vec3.cross(norm, tangent, bottomToTop));
        // norm.cross(tangent, bottomToTop).normalize();

        positions.push(pos[0], pos[1], pos[2]);
        normals.push(norm[0], norm[1], norm[2]);
        u = j / capSegments;
        v = i / heightSegments;
        uvs.push(u, 1.0 - v);

        // Pack UV1 to 1st third
        const _v = v;
        v = u;
        u = _v;
        u /= 3;
        u = u * primitiveUv1PaddingScale + primitiveUv1Padding;
        v = v * primitiveUv1PaddingScale + primitiveUv1Padding;
        uvs1.push(u, 1.0 - v);

        if (i < heightSegments && j < capSegments) {
          first = i * (capSegments + 1) + j;
          second = i * (capSegments + 1) + (j + 1);
          third = (i + 1) * (capSegments + 1) + j;
          fourth = (i + 1) * (capSegments + 1) + (j + 1);

          indices.push(first, second, third);
          indices.push(second, fourth, third);
        }
      }
    }
  }

  if (roundedCaps) {
    let lat: number;
    let lon: number;
    const latitudeBands = Math.floor(capSegments / 2);
    const longitudeBands = capSegments;
    const capOffset = height / 2;

    // Generate top cap
    for (lat = 0; lat <= latitudeBands; lat++) {
      theta = (lat * Math.PI * 0.5) / latitudeBands;
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

        positions.push(
          x * peakRadius,
          y * peakRadius + capOffset,
          z * peakRadius,
        );
        normals.push(x, y, z);
        uvs.push(u, 1.0 - v);

        // Pack UV1 to 2nd third
        u /= 3;
        v /= 3;
        u = u * primitiveUv1PaddingScale + primitiveUv1Padding;
        v = v * primitiveUv1PaddingScale + primitiveUv1Padding;
        u += 1.0 / 3;
        uvs1.push(u, 1.0 - v);
      }
    }

    offset = (heightSegments + 1) * (capSegments + 1);
    for (lat = 0; lat < latitudeBands; ++lat) {
      for (lon = 0; lon < longitudeBands; ++lon) {
        first = lat * (longitudeBands + 1) + lon;
        second = first + longitudeBands + 1;

        indices.push(offset + first + 1, offset + second, offset + first);
        indices.push(offset + first + 1, offset + second + 1, offset + second);
      }
    }

    // Generate bottom cap
    for (lat = 0; lat <= latitudeBands; lat++) {
      theta = Math.PI * 0.5 + (lat * Math.PI * 0.5) / latitudeBands;
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

        positions.push(
          x * peakRadius,
          y * peakRadius - capOffset,
          z * peakRadius,
        );
        normals.push(x, y, z);
        uvs.push(u, 1.0 - v);

        // Pack UV1 to 3rd third
        u /= 3;
        v /= 3;
        u = u * primitiveUv1PaddingScale + primitiveUv1Padding;
        v = v * primitiveUv1PaddingScale + primitiveUv1Padding;
        u += 2.0 / 3;
        uvs1.push(u, 1.0 - v);
      }
    }

    offset =
      (heightSegments + 1) * (capSegments + 1) +
      (longitudeBands + 1) * (latitudeBands + 1);
    for (lat = 0; lat < latitudeBands; ++lat) {
      for (lon = 0; lon < longitudeBands; ++lon) {
        first = lat * (longitudeBands + 1) + lon;
        second = first + longitudeBands + 1;

        indices.push(offset + first + 1, offset + second, offset + first);
        indices.push(offset + first + 1, offset + second + 1, offset + second);
      }
    }
  } else {
    // Generate bottom cap
    offset = (heightSegments + 1) * (capSegments + 1);
    if (baseRadius > 0.0) {
      for (i = 0; i < capSegments; i++) {
        theta = (i / capSegments) * 2.0 * Math.PI;
        x = Math.sin(theta);
        y = -height / 2.0;
        z = Math.cos(theta);
        u = 1.0 - (x + 1.0) / 2.0;
        v = (z + 1.0) / 2.0;

        positions.push(x * baseRadius, y, z * baseRadius);
        normals.push(0.0, -1.0, 0.0);
        uvs.push(u, 1.0 - v);

        // Pack UV1 to 2nd third
        u /= 3;
        v /= 3;
        u = u * primitiveUv1PaddingScale + primitiveUv1Padding;
        v = v * primitiveUv1PaddingScale + primitiveUv1Padding;
        u += 1.0 / 3;
        uvs1.push(u, 1.0 - v);

        if (i > 1) {
          indices.push(offset, offset + i, offset + i - 1);
        }
      }
    }

    // Generate top cap
    offset += capSegments;
    if (peakRadius > 0.0) {
      for (i = 0; i < capSegments; i++) {
        theta = (i / capSegments) * 2.0 * Math.PI;
        x = Math.sin(theta);
        y = height / 2.0;
        z = Math.cos(theta);
        u = 1.0 - (x + 1.0) / 2.0;
        v = (z + 1.0) / 2.0;

        positions.push(x * peakRadius, y, z * peakRadius);
        normals.push(0.0, 1.0, 0.0);
        uvs.push(u, 1.0 - v);

        // Pack UV1 to 3rd third
        u /= 3;
        v /= 3;
        u = u * primitiveUv1PaddingScale + primitiveUv1Padding;
        v = v * primitiveUv1PaddingScale + primitiveUv1Padding;
        u += 2.0 / 3;
        uvs1.push(u, 1.0 - v);

        if (i > 1) {
          indices.push(offset, offset + i - 1, offset + i);
        }
      }
    }
  }

  return {
    positions,
    normals,
    uvs,
    uvs1,
    indices,
  };
}
