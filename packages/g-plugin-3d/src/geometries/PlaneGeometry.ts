import type { Device } from '@antv/g-device-api';
import { ProceduralGeometry } from './ProceduralGeometry';

export interface PlaneGeometryProps {
  width: number;
  depth: number;
  widthSegments: number;
  depthSegments: number;
}

export class PlaneGeometry extends ProceduralGeometry<PlaneGeometryProps> {
  get width() {
    return this.props.width;
  }
  set width(v) {
    if (this.props.width !== v) {
      this.props.width = v;
      this.rebuildPosition();
    }
  }

  get depth() {
    return this.props.depth;
  }
  set depth(v) {
    if (this.props.depth !== v) {
      this.props.depth = v;
      this.rebuildPosition();
    }
  }

  get widthSegments() {
    return this.props.widthSegments;
  }
  set widthSegments(v) {
    if (this.props.widthSegments !== v) {
      this.props.widthSegments = v;
      this.build();
    }
  }

  get depthSegments() {
    return this.props.depthSegments;
  }
  set depthSegments(v) {
    if (this.props.depthSegments !== v) {
      this.props.depthSegments = v;
      this.build();
    }
  }

  constructor(device: Device, props: Partial<PlaneGeometryProps> = {}) {
    super(device, {
      width: 1,
      depth: 1,
      widthSegments: 5,
      depthSegments: 5,
      ...props,
    });
  }

  createTopology() {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const {
      widthSegments = 5,
      depthSegments = 5,
      width = 1,
      depth = 1,
    } = this.props;

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
}
