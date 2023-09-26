import type { Device } from '@antv/g-device-api';
import { ProceduralGeometry } from './ProceduralGeometry';
import { createConeData } from './util';

export interface CapsuleGeometryProps {
  /**
   * The radius of the tube forming the body of the capsule
   */
  radius: number;
  /**
   * The length of the body of the capsule from tip to tip
   */
  height: number;
  /**
   * The number of divisions along the tubular length of the capsule
   */
  heightSegments: number;
  /**
   * The number of divisions around the tubular body of the capsule
   */
  sides: number;
}

export class CapsuleGeometry extends ProceduralGeometry<CapsuleGeometryProps> {
  constructor(device: Device, props: Partial<CapsuleGeometryProps> = {}) {
    super(device, {
      radius: 0.5,
      height: 1,
      heightSegments: 1,
      sides: 20,
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

  get sides() {
    return this.props.sides;
  }
  set sides(v) {
    if (this.props.sides !== v) {
      this.props.sides = v;
      this.build();
    }
  }

  createTopology() {
    const { radius, height, heightSegments, sides } = this.props;

    const { indices, positions, normals, uvs, uvs1 } = createConeData(
      radius,
      radius,
      height - 2 * radius,
      heightSegments,
      sides,
      true,
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
