import { AbstractGroup } from '@antv/g-base';
import { ChangeType } from '@antv/g-base/lib/types';
import { IElement } from './interfaces';
import { Region } from './types';
import ShapeBase from './shape/base';
import * as Shape from './shape';
import { applyAttrsToContext, drawChildren, refreshElement } from './util/draw';
import { each } from '@antv/util';
import { intersectRect } from './util/util';

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

  cacheCanvasBBox() {
    const children = this.cfg.children;
    const xArr = [];
    const yArr = [];
    each(children, (child) => {
      const bbox = child.cfg.cacheCanvasBBox;
      if (bbox && child.cfg.isInView) {
        xArr.push(bbox.minX, bbox.maxX);
        yArr.push(bbox.minY, bbox.maxY);
      }
    });
    let bbox = null;
    if (xArr.length) {
      const minX = Math.min.apply(null, xArr);
      const maxX = Math.max.apply(null, xArr);
      const minY = Math.min.apply(null, yArr);
      const maxY = Math.max.apply(null, yArr);
      bbox = {
        minX,
        minY,
        x: minX,
        y: minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
      };
      const canvas = this.cfg.canvas;
      if (canvas) {
        const viewRange = canvas.getViewRange();
        this.set('isInView', intersectRect(bbox, viewRange));
      }
    } else {
      this.set('isInView', false);
    }

    this.set('cacheCanvasBBox', bbox);
  }

  draw(context: CanvasRenderingContext2D, region?: Region) {
    const children = this.cfg.children as IElement[];
    const allowDraw = region ? this.cfg.refresh : true; // 局部刷新需要判定
    if (children.length && allowDraw) {
      context.save();
      // group 上的矩阵和属性也会应用到上下文上
      // 先将 attrs 应用到上下文中，再设置 clip。因为 clip 应该被当前元素的 matrix 所影响
      applyAttrsToContext(context, this);
      this._applyClip(context, this.getClip() as ShapeBase);
      drawChildren(context, children, region);
      context.restore();
      this.cacheCanvasBBox();
    }
    // 这里的成本比较大，如果不绘制则不再
    // this.set('cacheCanvasBBox', this.getCanvasBBox());
    this.cfg.refresh = null;
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
