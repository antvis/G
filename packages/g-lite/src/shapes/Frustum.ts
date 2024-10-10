import type { mat4 } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import { Plane } from './Plane';

export enum Mask {
  OUTSIDE = 0xffffffff,
  INSIDE = 0x00000000,
  INDETERMINATE = 0x7fffffff,
}

export class Frustum {
  public planes: Plane[] = [];

  constructor(planes?: Plane[]) {
    if (planes) {
      this.planes = planes;
    } else {
      for (let i = 0; i < 6; i++) {
        this.planes.push(new Plane());
      }
    }
  }

  /**
   * extract 6 planes from projectionMatrix
   * @see http://www8.cs.umu.se/kurser/5DV051/HT12/lab/plane_extraction.pdf
   */
  public extractFromVPMatrix(projectionMatrix: mat4) {
    // @ts-ignore
    const [
      m0,
      m1,
      m2,
      m3,
      m4,
      m5,
      m6,
      m7,
      m8,
      m9,
      m10,
      m11,
      m12,
      m13,
      m14,
      m15,
    ] = projectionMatrix;

    // right
    vec3.set(this.planes[0].normal, m3 - m0, m7 - m4, m11 - m8);
    this.planes[0].distance = m15 - m12;

    // left
    vec3.set(this.planes[1].normal, m3 + m0, m7 + m4, m11 + m8);
    this.planes[1].distance = m15 + m12;

    // bottom
    vec3.set(this.planes[2].normal, m3 + m1, m7 + m5, m11 + m9);
    this.planes[2].distance = m15 + m13;

    // top
    vec3.set(this.planes[3].normal, m3 - m1, m7 - m5, m11 - m9);
    this.planes[3].distance = m15 - m13;

    // far
    vec3.set(this.planes[4].normal, m3 - m2, m7 - m6, m11 - m10);
    this.planes[4].distance = m15 - m14;

    // near
    vec3.set(this.planes[5].normal, m3 + m2, m7 + m6, m11 + m10);
    this.planes[5].distance = m15 + m14;

    this.planes.forEach((plane) => {
      plane.normalize();
      plane.updatePNVertexFlag();
    });
  }
}
