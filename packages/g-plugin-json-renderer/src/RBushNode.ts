export interface RBushNodeAABB {
  id: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
export class RBushNode {
  static tag = 'c-canvas-rbush-node';

  aabb: RBushNodeAABB;
}
