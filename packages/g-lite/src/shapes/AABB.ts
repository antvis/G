import type { mat4 } from 'gl-matrix';
// import { vec3 } from 'gl-matrix';
import { Tuple3Number } from '../types';
import {
  addVec3,
  copyVec3,
  maxVec3,
  minVec3,
  scaleVec3,
  subVec3,
} from '../utils/math';
import type { Plane } from './Plane';

/**
 * Axis-Aligned Bounding Box
 * 为了便于后续 Frustum Culling，通过查找表定义 p-vertex 和 n-vertex
 * @see https://github.com/antvis/GWebGPUEngine/issues/3
 */
export class AABB {
  static isEmpty(aabb: AABB) {
    return (
      !aabb ||
      (aabb.halfExtents[0] === 0 &&
        aabb.halfExtents[1] === 0 &&
        aabb.halfExtents[2] === 0)
    );
  }

  center: Tuple3Number = [0, 0, 0];
  halfExtents: Tuple3Number = [0, 0, 0];
  min: Tuple3Number = [0, 0, 0];
  max: Tuple3Number = [0, 0, 0];

  // center: vec3 = vec3.create();

  // halfExtents: vec3 = vec3.create();

  // min: vec3 = vec3.create();
  // max: vec3 = vec3.create();

  update(center: Tuple3Number, halfExtents: Tuple3Number) {
    copyVec3(this.center, center);
    copyVec3(this.halfExtents, halfExtents);
    subVec3(this.min, this.center, this.halfExtents);
    addVec3(this.max, this.center, this.halfExtents);
    // vec3.copy(this.center, center);
    // vec3.copy(this.halfExtents, halfExtents);
    // vec3.sub(this.min, this.center, this.halfExtents);
    // vec3.add(this.max, this.center, this.halfExtents);
  }

  setMinMax(min: Tuple3Number, max: Tuple3Number) {
    // vec3.add(this.center, max, min);
    // vec3.scale(this.center, this.center, 0.5);

    // vec3.sub(this.halfExtents, max, min);
    // vec3.scale(this.halfExtents, this.halfExtents, 0.5);

    // vec3.copy(this.min, min);
    // vec3.copy(this.max, max);

    addVec3(this.center, max, min);
    scaleVec3(this.center, this.center, 0.5);
    subVec3(this.halfExtents, max, min);
    scaleVec3(this.halfExtents, this.halfExtents, 0.5);
    copyVec3(this.min, min);
    copyVec3(this.max, max);
  }

  getMin() {
    return this.min;
  }

  getMax() {
    return this.max;
  }

  add(aabb: AABB) {
    if (AABB.isEmpty(aabb)) {
      return;
    }
    if (AABB.isEmpty(this)) {
      this.setMinMax(aabb.getMin(), aabb.getMax());
      return;
    }

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

  setFromTransformedAABB(aabb: AABB, m: mat4) {
    const bc = this.center;
    const br = this.halfExtents;
    const ac = aabb.center;
    const ar = aabb.halfExtents;

    const mx0 = m[0];
    const mx1 = m[4];
    const mx2 = m[8];
    const my0 = m[1];
    const my1 = m[5];
    const my2 = m[9];
    const mz0 = m[2];
    const mz1 = m[6];
    const mz2 = m[10];

    const mx0a = Math.abs(mx0);
    const mx1a = Math.abs(mx1);
    const mx2a = Math.abs(mx2);
    const my0a = Math.abs(my0);
    const my1a = Math.abs(my1);
    const my2a = Math.abs(my2);
    const mz0a = Math.abs(mz0);
    const mz1a = Math.abs(mz1);
    const mz2a = Math.abs(mz2);

    bc[0] = m[12] + mx0 * ac[0] + mx1 * ac[1] + mx2 * ac[2];
    bc[1] = m[13] + my0 * ac[0] + my1 * ac[1] + my2 * ac[2];
    bc[2] = m[14] + mz0 * ac[0] + mz1 * ac[1] + mz2 * ac[2];

    // vec3.set(
    //   bc,
    //   m[12] + mx0 * ac[0] + mx1 * ac[1] + mx2 * ac[2],
    //   m[13] + my0 * ac[0] + my1 * ac[1] + my2 * ac[2],
    //   m[14] + mz0 * ac[0] + mz1 * ac[1] + mz2 * ac[2],
    // );

    br[0] = mx0a * ar[0] + mx1a * ar[1] + mx2a * ar[2];
    br[1] = my0a * ar[0] + my1a * ar[1] + my2a * ar[2];
    br[2] = mz0a * ar[0] + mz1a * ar[1] + mz2a * ar[2];

    // vec3.set(
    //   br,
    //   mx0a * ar[0] + mx1a * ar[1] + mx2a * ar[2],
    //   my0a * ar[0] + my1a * ar[1] + my2a * ar[2],
    //   mz0a * ar[0] + mz1a * ar[1] + mz2a * ar[2],
    // );

    // this.min = vec3.sub(this.min, bc, br);
    // this.max = vec3.add(this.max, bc, br);

    subVec3(this.min, bc, br);
    addVec3(this.max, bc, br);
  }

  intersects(aabb: AABB) {
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

  intersection(aabb: AABB): AABB | null {
    if (!this.intersects(aabb)) {
      return null;
    }

    const intersection = new AABB();
    // const min = vec3.max(vec3.create(), this.getMin(), aabb.getMin());
    // const max = vec3.min(vec3.create(), this.getMax(), aabb.getMax());
    const min = maxVec3([0, 0, 0], this.getMin(), aabb.getMin());
    const max = minVec3([0, 0, 0], this.getMax(), aabb.getMax());
    intersection.setMinMax(min, max);

    return intersection;
  }

  // containsPoint(point: vec3) {
  //   const min = this.getMin();
  //   const max = this.getMax();

  //   return !(
  //     point[0] < min[0] ||
  //     point[0] > max[0] ||
  //     point[1] < min[1] ||
  //     point[1] > max[1] ||
  //     point[2] < min[2] ||
  //     point[2] > max[2]
  //   );
  // }

  /**
   * get n-vertex
   * @param plane plane of CullingVolume
   */
  getNegativeFarPoint(plane: Plane): Tuple3Number {
    if (plane.pnVertexFlag === 0x111) {
      return copyVec3([0, 0, 0], this.min);
      // return vec3.copy(vec3.create(), this.min);
    } else if (plane.pnVertexFlag === 0x110) {
      return [this.min[0], this.min[1], this.max[2]];
      // return vec3.fromValues(this.min[0], this.min[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x101) {
      return [this.min[0], this.max[1], this.min[2]];
      // return vec3.fromValues(this.min[0], this.max[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x100) {
      return [this.min[0], this.max[1], this.max[2]];
      // return vec3.fromValues(this.min[0], this.max[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x011) {
      return [this.max[0], this.min[1], this.min[2]];
      // return vec3.fromValues(this.max[0], this.min[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x010) {
      return [this.max[0], this.min[1], this.max[2]];
      // return vec3.fromValues(this.max[0], this.min[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x001) {
      return [this.max[0], this.max[1], this.min[2]];
      // return vec3.fromValues(this.max[0], this.max[1], this.min[2]);
    } else {
      return [this.max[0], this.max[1], this.max[2]];
      // return vec3.fromValues(this.max[0], this.max[1], this.max[2]);
    }
  }

  /**
   * get p-vertex
   * @param plane plane of CullingVolume
   */
  getPositiveFarPoint(plane: Plane): Tuple3Number {
    if (plane.pnVertexFlag === 0x111) {
      return copyVec3([0, 0, 0], this.max);
      // return vec3.copy(vec3.create(), this.max);
    } else if (plane.pnVertexFlag === 0x110) {
      return [this.max[0], this.max[1], this.min[2]];
      // return vec3.fromValues(this.max[0], this.max[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x101) {
      return [this.max[0], this.min[1], this.max[2]];
      // return vec3.fromValues(this.max[0], this.min[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x100) {
      return [this.max[0], this.min[1], this.min[2]];
      // return vec3.fromValues(this.max[0], this.min[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x011) {
      return [this.min[0], this.max[1], this.max[2]];
      // return vec3.fromValues(this.min[0], this.max[1], this.max[2]);
    } else if (plane.pnVertexFlag === 0x010) {
      return [this.min[0], this.max[1], this.min[2]];
      // return vec3.fromValues(this.min[0], this.max[1], this.min[2]);
    } else if (plane.pnVertexFlag === 0x001) {
      return [this.min[0], this.min[1], this.max[2]];
      // return vec3.fromValues(this.min[0], this.min[1], this.max[2]);
    } else {
      return [this.min[0], this.min[1], this.min[2]];
      // return vec3.fromValues(this.min[0], this.min[1], this.min[2]);
    }
  }
}
