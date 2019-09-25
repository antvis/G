import { AbstractGroup } from '@antv/g-base';
import { ChangeType } from '@antv/g-base/lib/types';
import { Region } from './types';
import Shape from './shape';
import { each, mergeRegion } from './util/util';
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
  _applyClip(context, clip: Shape) {
    if (clip) {
      clip.createPath(context);
      context.clip();
    }
  }

  draw(context: CanvasRenderingContext2D, region?: Region) {
    const children = this.getChildren();
    if (children.length) {
      context.save();
      this._applyClip(context, this.getClip() as Shape);
      // group 上的矩阵和属性也会应用到上下文上
      applyAttrsToContext(context, this);
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
