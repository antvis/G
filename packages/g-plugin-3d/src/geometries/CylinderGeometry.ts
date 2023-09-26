import type { Device } from '@antv/g-device-api';
import { ProceduralGeometry } from './ProceduralGeometry';
import { createConeData } from './util';

export interface CylinderGeometryProps {
  /**
   * The radius of the tube forming the body of the cylinder
   */
  radius: number;
  /**
   * The length of the body of the cylinder
   */
  height: number;
  /**
   * The number of divisions along the length of the cylinder
   */
  heightSegments: number;
  /**
   * The number of divisions around the tubular body of the cylinder
   */
  capSegments: number;
}

export class CylinderGeometry extends ProceduralGeometry<CylinderGeometryProps> {
  constructor(device: Device, props: Partial<CylinderGeometryProps> = {}) {
    super(device, {
      radius: 0.5,
      height: 1,
      heightSegments: 5,
      capSegments: 20,
      ...props,
    });
  }

  get radius() {
    return this.props.radius;
  }
  set radius(v) {
    if (this.props.radius !== v) {
      this.props.radius = v;
      this.rebuildPosition();
    }
  }

  get height() {
    return this.props.height;
  }
  set height(v) {
    if (this.props.height !== v) {
      this.props.height = v;
      this.rebuildPosition();
    }
  }

  get heightSegments() {
    return this.props.heightSegments;
  }
  set heightSegments(v) {
    if (this.props.heightSegments !== v) {
      this.props.heightSegments = v;
      this.build();
    }
  }

  get capSegments() {
    return this.props.capSegments;
  }
  set capSegments(v) {
    if (this.props.capSegments !== v) {
      this.props.capSegments = v;
      this.build();
    }
  }

  createTopology() {
    const { radius, height, heightSegments, capSegments } = this.props;

    const { indices, positions, normals, uvs, uvs1 } = createConeData(
      radius,
      radius,
      height,
      heightSegments,
      capSegments,
      false,
    );

    return {
      indices,
      positions,
      normals,
      uvs,
      uv1s: uvs1,
    };
  }
}
