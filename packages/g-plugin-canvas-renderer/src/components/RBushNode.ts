import { Component } from '@antv/g';

export interface RBushNodeAABB {
  name: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
export class RBushNode extends Component {
  static tag = 'c-canvas-rbush-node';

  aabb: RBushNodeAABB;
}
