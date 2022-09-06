import { Syringe } from '@alipay/mana-syringe';

export interface RBushNodeAABB {
  id: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
export interface RBushNode {
  aabb?: RBushNodeAABB;
}

export const RBushRoot = Syringe.defineToken('');
