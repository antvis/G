import { AbstractGroup } from '@antv/g-base';
import { ChangeType } from '@antv/g-base/lib/types';
import { IElement } from './interfaces';
import { Region } from './types';
import ShapeBase from './shape/base';
import * as Shape from './shape';
import { applyAttrsToContext, drawChildren, refreshElement } from './util/draw';

class Group extends AbstractGroup {
  /**
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType) {
    refreshElement(this, changeType);
  }

  getShapeBase() {
    return Shape;
  }

  getGroupBase() {
    return Group;
  }

  // 同 shape 中的方法重复了
  _applyClip(context, clip: ShapeBase) {
    if (clip) {
      context.save();
      // 将 clip 的属性挂载到 context 上
      applyAttrsToContext(context, clip);
      // 绘制 clip 路径
      clip.createPath(context);
      context.restore();
      // 裁剪
      context.clip();
      clip._afterDraw();
    }
  }

  draw(context: CanvasRenderingContext2D, region?: Region) {
    const children = this.getChildren() as IElement[];
    if (children.length) {
      context.save();
      // group 上的矩阵和属性也会应用到上下文上
      // 先将 attrs 应用到上下文中，再设置 clip。因为 clip 应该被当前元素的 matrix 所影响
      applyAttrsToContext(context, this);
      this._applyClip(context, this.getClip() as ShapeBase);
      drawChildren(context, children, region);
      context.restore();
    }
    // 这里的成本比较大
    this.set('cacheCanvasBBox', this.getCanvasBBox());
    // 绘制后，消除更新标记
    this.set('hasChanged', false);
  }
  // 绘制时被跳过，一般发生在分组隐藏时
  skipDraw() {
    this.set('cacheCanvasBBox', null);
    this.set('hasChanged', false);
  }
}

export default Group;
