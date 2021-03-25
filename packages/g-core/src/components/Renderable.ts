import { Component } from '@antv/g-ecs';
import { SHAPE } from '..';
import { AABB } from '../shapes';
import { ShapeAttrs } from '../types';

export interface RBushNode {
  name: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class Renderable extends Component {
  public static tag = 'c-renderable';

  /**
   * circle/ellipse..
   */
  public type: SHAPE;

  /**
   * assigned by shape.attrs
   */
  public attrs: ShapeAttrs;

  /**
   * aabb 应该存在 Renderable 而非 Geometry 中，原因包括：
   * 1. 包围盒会受 transform 影响。例如每次 transform 之后应该重新计算包围盒（center 发生偏移）。
   * 2. 多个 Mesh 可以共享一个 Geometry，但可以各自拥有不同的 aabb
   */
  public aabb: AABB;

  /**
   * transform 之后需要重新计算包围盒
   */
  public aabbDirty = false;

  /**
   * id & aabb
   */
  public rBushNode: RBushNode;

  /**
   * dirty rectangle flag
   */
  public dirty = false;

  /**
   * last dirty rectangle(aabb)
   */
  public dirtyAABB: AABB;
}
