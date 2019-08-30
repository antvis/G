import { IElement } from '@antv/g-base/lib/interfaces';
import { Region } from './types';

export interface ICanvasElement extends IElement {
  /**
   * 绘制图形元素
   * @param {CanvasRenderingContext2D} context 上下文
   * @param {Region}                   [region]  限制的区间，可以为空
   */
  draw(context: CanvasRenderingContext2D, region?: Region);
  /**
   * 跳过绘制时需要处理的逻辑
   */
  skipDraw();
}
