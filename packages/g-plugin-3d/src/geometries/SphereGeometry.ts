import type { Device } from '@antv/g-device-api';
import { ProceduralGeometry } from './ProceduralGeometry';

export interface SphereGeometryProps {
  radius: number;
  latitudeBands: number;
  longitudeBands: number;
}

export class SphereGeometry extends ProceduralGeometry<SphereGeometryProps> {
  constructor(device: Device, props: Partial<SphereGeometryProps> = {}) {
    super(device, {
      radius: 0.5,
      latitudeBands: 16,
      longitudeBands: 16,
      ...props,
    });
  }

  get radius() {
    return this.props.radius;
  }
  set radius(v) {
    if (this.props.radius !== v) {
      this.props.radius = v;
      this.build();
    }
  }

  get latitudeBands() {
    return this.props.latitudeBands;
  }
  set latitudeBands(v) {
    if (this.props.latitudeBands !== v) {
      this.props.latitudeBands = v;
      this.build();
    }
  }

  get longitudeBands() {
    return this.props.longitudeBands;
  }
  set longitudeBands(v) {
    if (this.props.longitudeBands !== v) {
      this.props.longitudeBands = v;
      this.build();
    }
  }

  createTopology() {
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

    const {
      radius = 0.5,
      latitudeBands = 16,
      longitudeBands = 16,
    } = this.props;

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

        indices.push(first + 1, second, first);
        indices.push(first + 1, second + 1, second);
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
}
