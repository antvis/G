import { Component } from '@antv/g-ecs';
import { AABB } from '../shapes';

export class Renderable extends Component {
  static tag = 'c-renderable';

  /**
   * aabb 应该存在 Renderable 而非 Geometry 中，原因包括：
   * 1. 包围盒会受 transform 影响。例如每次 transform 之后应该重新计算包围盒（center 发生偏移）。
   * 2. 多个 Mesh 可以共享一个 Geometry，但可以各自拥有不同的 aabb
   */
  aabb: AABB | undefined;

  aabbDirty = true;

  /**
   * dirty rectangle(aabb) in last render frame
   */
  dirtyAABB: AABB;

  /**
   * dirty rectangle flag
   */
  dirty = false;

  /**
   * is instanced
   */
  instanced = false;
}
