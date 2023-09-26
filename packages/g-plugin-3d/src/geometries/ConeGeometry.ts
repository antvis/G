import type { Device } from '@antv/g-device-api';
import { ProceduralGeometry } from './ProceduralGeometry';
import { createConeData } from './util';

export interface ConeGeometryProps {
  /**
   * The base radius of the cone
   */
  baseRadius: number;
  /**
   * The peak radius of the cone
   */
  peakRadius: number;
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

export class ConeGeometry extends ProceduralGeometry<ConeGeometryProps> {
  constructor(device: Device, props: Partial<ConeGeometryProps> = {}) {
    super(device, {
      baseRadius: 0.5,
      peakRadius: 0,
      height: 1,
      heightSegments: 5,
      capSegments: 18,
      ...props,
    });
  }

  get baseRadius() {
    return this.props.baseRadius;
  }
  set baseRadius(v) {
    if (this.props.baseRadius !== v) {
      this.props.baseRadius = v;
      this.rebuildPosition();
    }
  }

  get peakRadius() {
    return this.props.peakRadius;
  }
  set peakRadius(v) {
    if (this.props.peakRadius !== v) {
      this.props.peakRadius = v;
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
    const { baseRadius, peakRadius, height, heightSegments, capSegments } =
      this.props;

    const { indices, positions, normals, uvs, uvs1 } = createConeData(
      baseRadius,
      peakRadius,
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
