import { IElement, IGroup, IShape } from '@antv/g-base/lib/interfaces';
import Defs from './defs';

export interface ISVGElement extends IElement {
  /**
   * 裁剪和绘制图形元素
   * @param {Defs} context 上下文
   */
  draw(context: Defs);

  /**
   * 裁剪
   * @param {Defs} context 上下文
   */
  applyClip(context);

  /**
   * 绘制图形元素
   * @param {Defs} context 上下文
   */
  drawPath(context);
}

export interface ISVGGroup extends IGroup {
  /**
   * 创建分组容器，对应 <g> 元素
   * @return {SVGGElement} 分组容器
   */
  createDom(): SVGGElement;
}

export interface ISVGShape extends IShape {
  type: string;
  canFill: boolean;
  canStroke: boolean;
}
