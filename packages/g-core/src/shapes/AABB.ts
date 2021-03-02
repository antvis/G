import { vec3 } from 'gl-matrix';
import { Plane } from './Plane';

/**
 * Axis-Aligned Bounding Box
 * 为了便于后续 Frustum Culling，通过查找表定义 p-vertex 和 n-vertex
 * @see https://github.com/antvis/GWebGPUEngine/issues/3
 */
export class AABB {
  public center: vec3;

  public halfExtents: vec3;

  private min: vec3 = vec3.create();
  private max: vec3 = vec3.create();

  constructor(center?: vec3, halfExtents?: vec3) {
    this.update(center, halfExtents);
  }

  public update(center?: vec3, halfExtents?: vec3) {
    this.center = center || vec3.create();
    this.halfExtents = halfExtents || vec3.fromValues(0.5, 0.5, 0.5);
    this.min = vec3.sub(this.min, this.center, this.halfExtents);
    this.max = vec3.add(this.max, this.center, this.halfExtents);
  }

  public setMinMax(min: vec3, max: vec3) {
    vec3.add(this.center, max, min);
    vec3.scale(this.center, this.center, 0.5);

    vec3.sub(this.halfExtents, max, min);
    vec3.scale(this.halfExtents, this.halfExtents, 0.5);

    vec3.copy(this.min, min);
    vec3.copy(this.max, max);
  }

  public getMin() {
    return this.min;
  }

  public getMax() {
    return this.max;
  }

  public add(aabb: AABB) {
    const tc = this.center;
    const tcx = tc[0];
    const tcy = tc[1];
    const tcz = tc[2];
    const th = this.halfExtents;
    const thx = th[0];
    const thy = th[1];
    const thz = th[2];
    let tminx = tcx - thx;
    let tmaxx = tcx + thx;
    let tminy = tcy - thy;
    let tmaxy = tcy + thy;
    let tminz = tcz - thz;
    let tmaxz = tcz + thz;

    const oc = aabb.center;
    const ocx = oc[0];
    const ocy = oc[1];
    const ocz = oc[2];
    const oh = aabb.halfExtents;
    const ohx = oh[0];
    const ohy = oh[1];
    const ohz = oh[2];
    const ominx = ocx - ohx;
    const omaxx = ocx + ohx;
    const ominy = ocy - ohy;
    const omaxy = ocy + ohy;
    const ominz = ocz - ohz;
    const omaxz = ocz + ohz;

    if (ominx < tminx) {
      tminx = ominx;
    }
    if (omaxx > tmaxx) {
      tmaxx = omaxx;
    }
    if (ominy < tminy) {
      tminy = ominy;
    }
    if (omaxy > tmaxy) {
      tmaxy = omaxy;
    }
    if (ominz < tminz) {
      tminz = ominz;
    }
    if (omaxz > tmaxz) {
      tmaxz = omaxz;
    }

    tc[0] = (tminx + tmaxx) * 0.5;
    tc[1] = (tminy + tmaxy) * 0.5;
    tc[2] = (tminz + tmaxz) * 0.5;
    th[0] = (tmaxx - tminx) * 0.5;
    th[1] = (tmaxy - tminy) * 0.5;
    th[2] = (tmaxz - tminz) * 0.5;

    this.min[0] = tminx;
    this.min[1] = tminy;
    this.min[2] = tminz;
    this.max[0] = tmaxx;
    this.max[1] = tmaxy;
    this.max[2] = tmaxz;
  }

  public intersects(aabb: AABB) {
    const aMax = this.getMax();
    const aMin = this.getMin();
    const bMax = aabb.getMax();
    const bMin = aabb.getMin();

    return (
      aMin[0] <= bMax[0] &&
      aMax[0] >= bMin[0] &&
      aMin[1] <= bMax[1] &&
      aMax[1] >= bMin[1] &&
      aMin[2] <= bMax[2] &&
      aMax[2] >= bMin[2]
    );
  }

  public containsPoint(point: vec3) {
    const min = this.getMin();
    const max = this.getMax();

    return !(
      point[0] < min[0] ||
      point[0] > max[0] ||
      point[1] < min[1] ||
      point[1] > max[1] ||
      point[2] < min[2] ||
      point[2] > max[2]
    );
  }

  /**
   * get n-vertex
   * @param plane plane of CullingVolume
   */
  public getNegativeFarPoint(plane: Plane) {
    if (plane.pnVertexFlag === 0x111) {
      return vec3.copy(vec3.create(), this.min);
    } else if (plane.pnVertexFlag === 0x110) {
      return vec3.fromValues(this.min[0], this.min[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x101) {
      return vec3.fromValues(this.min[0], this.max[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x100) {
      return vec3.fromValues(this.min[0], this.max[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x011) {
      return vec3.fromValues(this.max[0], this.min[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x010) {
      return vec3.fromValues(this.max[0], this.min[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x001) {
      return vec3.fromValues(this.max[0], this.max[1], this.min[2]);
    } else {
      return vec3.fromValues(this.max[0], this.max[1], this.max[2]);
    }
  }

  /**
   * get p-vertex
   * @param plane plane of CullingVolume
   */
  public getPositiveFarPoint(plane: Plane) {
    if (plane.pnVertexFlag === 0x111) {
      return vec3.copy(vec3.create(), this.max);
    } else if (plane.pnVertexFlag === 0x110) {
      return vec3.fromValues(this.max[0], this.max[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x101) {
      return vec3.fromValues(this.max[0], this.min[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x100) {
      return vec3.fromValues(this.max[0], this.min[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x011) {
      return vec3.fromValues(this.min[0], this.max[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x010) {
      return vec3.fromValues(this.min[0], this.max[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x001) {
      return vec3.fromValues(this.min[0], this.min[1], this.max[2]);
    } else {
      return vec3.fromValues(this.min[0], this.min[1], this.min[2]);
    }
  }
}
