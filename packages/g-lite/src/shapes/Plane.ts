import { vec3 } from 'gl-matrix';

export class Plane {
  public distance: number;
  public normal: vec3;

  /**
   * lookup table for p-vertex & n-vertex when doing frustum culling
   */
  public pnVertexFlag: number;

  constructor(distance?: number, normal?: vec3) {
    this.distance = distance || 0;
    this.normal = normal || vec3.fromValues(0, 1, 0);
    this.updatePNVertexFlag();
  }

  public updatePNVertexFlag() {
    this.pnVertexFlag =
      (Number(this.normal[0] >= 0) << 8) +
      (Number(this.normal[1] >= 0) << 4) +
      Number(this.normal[2] >= 0);
  }

  public distanceToPoint(point: vec3) {
    return vec3.dot(point, this.normal) - this.distance;
  }

  public normalize() {
    const invLen = 1 / vec3.len(this.normal);
    vec3.scale(this.normal, this.normal, invLen);
    this.distance *= invLen;
  }

  public intersectsLine(start: vec3, end: vec3, point?: vec3) {
    const d0 = this.distanceToPoint(start);
    const d1 = this.distanceToPoint(end);
    const t = d0 / (d0 - d1);
    const intersects = t >= 0 && t <= 1;
    if (intersects && point) {
      vec3.lerp(point, start, end, t);
    }
    return intersects;
  }
}
