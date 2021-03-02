import { Component } from '@antv/g-ecs';
import { AABB } from '../shapes';
import { ShapeAttrs } from '../types';

export class Renderable extends Component {
  public static tag = 'c-renderable';

  public type: string;

  public attrs: ShapeAttrs;

  /**
   * aabb 应该存在 Renderable 而非 Geometry 中，原因包括：
   * 1. 包围盒会受 transform 影响。例如每次 transform 之后应该重新计算包围盒（center 发生偏移）。
   * 2. 多个 Mesh 可以共享一个 Geometry，但可以各自拥有不同的 aabb
   */
  public aabb: AABB = new AABB();

  /**
   * transform 之后需要重新计算包围盒
   */
  public aabbDirty = true;

  public visible = true;

  public model: any;
}
