import { vec3 } from 'gl-matrix';

const tmpVecA = vec3.create();

export class BoundingSphere {
  public center: vec3;
  public radius: number;

  constructor(center?: vec3, radius?: number) {
    this.center = center || vec3.create();
    this.radius = radius || 0.5;
  }

  public containsPoint(point: vec3) {
    vec3.sub(tmpVecA, point, this.center);
    return vec3.length(tmpVecA) < this.radius * this.radius;
  }

  public intersects(sphere: BoundingSphere) {
    vec3.sub(tmpVecA, sphere.center, this.center);
    const totalRadius = sphere.radius + this.radius;

    if (vec3.length(tmpVecA) <= totalRadius * totalRadius) {
      return true;
    }

    return false;
  }
}
