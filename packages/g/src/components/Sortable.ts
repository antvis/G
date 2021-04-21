import { Component } from '@antv/g-ecs';

export class Sortable extends Component {
  static tag = 'c-sortable';

  /**
   * 影响同一 `Group` 内的渲染次序，可配合 `toFront/toBack` 使用
   * 同一 `Group` 内，zIndex 越大，绘制顺序越靠后，在画家算法中就会出现在上层
   */
  zIndex: number = 0;
}
