import { AbstractShape, BBox } from '@antv/g-base';
import { ChangeType } from '@antv/g-base/lib/types';
import { isNil, intersectRect } from '../util/util';
import { applyAttrsToContext, refreshElement } from '../util/draw';
import { Region } from '../types';

class ShapeBase extends AbstractShape {
  getDefaultAttrs() {
    const attrs = super.getDefaultAttrs();
    // 设置默认值
    attrs['lineWidth'] = 1;
    attrs['lineAppendWidth'] = 0;
    attrs['strokeOpacity'] = 1;
    attrs['fillOpacity'] = 1;
    return attrs;
  }

  /**
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType) {
    refreshElement(this, changeType);
  }

  calculateBBox(): BBox {
    const type = this.get('type');
    const lineWidth = this.getHitLineWidth();
    const attrs = this.attr();
    const box = this.getInnerBox(attrs);
    const halfLineWidth = lineWidth / 2;
    const minX = box.x - halfLineWidth;
    const minY = box.y - halfLineWidth;
    const maxX = box.x + box.width + halfLineWidth;
    const maxY = box.y + box.height + halfLineWidth;
    return BBox.fromRange(minX, minY, maxX, maxY);
  }

  /**
   * @protected
   */
  getInnerBox(attrs) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  isFill() {
    return !!this.attrs['fill'] || this.isClipShape();
  }

  isStroke() {
    return !!this.attrs['stroke'];
  }

  // 同 shape 中的方法重复了
  _applyClip(context, clip: ShapeBase) {
    if (clip) {
      clip.createPath(context);
      context.clip();
    }
  }

  // 绘制图形时需要考虑 region 限制
  draw(context: CanvasRenderingContext2D, region?: Region) {
    // 如果指定了区域，则同指定区域相交时渲染
    if (region) {
      const bbox = this.getCanvasBBox();
      if (!intersectRect(region, bbox)) {
        return;
      }
    }
    context.save();
    this._applyClip(context, this.getClip() as ShapeBase);
    applyAttrsToContext(context, this);
    this.drawPath(context);
    context.restore();
    this._afterDraw();
  }

  _afterDraw() {
    // 绘制的时候缓存包围盒
    this.set('cacheCanvasBBox', this.getCanvasBBox());
    // 绘制后消除标记
    this.set('hasChanged', false);
  }

  skipDraw() {
    this.set('cacheCanvasBBox', null);
    this.set('hasChanged', false);
  }

  /**
   * 绘制图形的路径
   * @param {CanvasRenderingContext2D} context 上下文
   */
  drawPath(context: CanvasRenderingContext2D) {
    this.createPath(context);
    this.strokeAndFill(context);
    this.afterDrawPath(context);
  }

  /**
   * @protected
   * 填充图形
   * @param {CanvasRenderingContext2D} context context 上下文
   */
  fill(context: CanvasRenderingContext2D) {
    context.fill();
  }

  /**
   * @protected
   * 绘制图形边框
   * @param {CanvasRenderingContext2D} context context 上下文
   */
  stroke(context: CanvasRenderingContext2D) {
    context.stroke();
  }

  // 绘制或者填充
  strokeAndFill(context) {
    const attrs = this.attrs;
    const originOpacity = context.globalAlpha;

    if (this.isFill()) {
      const fillOpacity = attrs['fillOpacity'];
      if (!isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
        this.fill(context);
        context.globalAlpha = originOpacity;
      } else {
        this.fill(context);
      }
    }

    if (this.isStroke()) {
      const lineWidth = attrs['lineWidth'];
      if (lineWidth > 0) {
        const strokeOpacity = attrs['strokeOpacity'];
        if (!isNil(strokeOpacity) && strokeOpacity !== 1) {
          context.globalAlpha = strokeOpacity;
        }
        this.stroke(context);
      }
    }
    this.afterDrawPath(context);
  }

  /**
   * @protected
   * 绘制图形的路径
   * @param {CanvasRenderingContext2D} context 上下文
   */
  createPath(context: CanvasRenderingContext2D) {}

  /**
   * 绘制完成 path 后的操作
   * @param {CanvasRenderingContext2D} context 上下文
   */
  afterDrawPath(context: CanvasRenderingContext2D) {}

  isInShape(refX: number, refY: number): boolean {
    // return HitUtil.isHitShape(this, refX, refY);
    const isStroke = this.isStroke();
    const isFill = this.isFill();
    const lineWidth = this.getHitLineWidth();
    return this.isInStrokeOrPath(refX, refY, isStroke, isFill, lineWidth);
  }

  // 之所以不拆成 isInStroke 和 isInPath 在于两者存在一些共同的计算
  isInStrokeOrPath(x, y, isStroke, isFill, lineWidth) {
    return false;
  }

  /**
   * 获取线拾取的宽度
   * @returns {number} 线的拾取宽度
   */
  getHitLineWidth() {
    if (!this.isStroke()) {
      return 0;
    }
    const attrs = this.attrs;
    return attrs['lineWidth'] + attrs['lineAppendWidth'];
  }
}

export default ShapeBase;
