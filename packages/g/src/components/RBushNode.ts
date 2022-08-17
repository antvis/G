import { Syringe } from 'mana-syringe';

export interface RBushNodeAABB {
  id: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
export class RBushNode {
  static tag = 'c-rbush-node';

  aabb: RBushNodeAABB;
}

export const RBushRoot = Syringe.defineToken('');
