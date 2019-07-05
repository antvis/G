import { AbstractShape } from '@antv/g-base';
import { isNil } from '../util/util';
import BoxUtil from '../util/box';
import HitUtil from '../util/hit';
import { applyAttrsToContext } from '../util/draw';

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

  calculateBBox() {
    const type = this.get('type');
    const lineWidth = this.isStroke() ? this.getHitLineWidth() : 0;
    const attrs = this.attr();
    return BoxUtil.getBBox(type, attrs, lineWidth);
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

  draw(context) {
    context.save();
    this._applyClip(context, this.getClip() as ShapeBase);
    applyAttrsToContext(context, this);
    this.drawPath(context);
    context.restore();
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

  // 绘制或者填充
  strokeAndFill(context) {
    const attrs = this.attrs;
    const originOpacity = context.globalAlpha;

    if (attrs['fill']) {
      const fillOpacity = attrs['fillOpacity'];
      if (!isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
        context.fill();
        context.globalAlpha = originOpacity;
      } else {
        context.fill();
      }
    }

    if (attrs['stroke']) {
      const lineWidth = attrs['lineWidth'];
      if (lineWidth > 0) {
        const strokeOpacity = attrs['strokeOpacity'];
        if (!isNil(strokeOpacity) && strokeOpacity !== 1) {
          context.globalAlpha = strokeOpacity;
        }
        context.stroke();
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
    return HitUtil.isHitShape(this, refX, refY);
  }

  /**
   * 获取线拾取的宽度
   * @returns {number} 线的拾取宽度
   */
  getHitLineWidth() {
    const attrs = this.attrs;
    return attrs['lineWidth'] + attrs['lineAppendWidth'];
  }
}

export default ShapeBase;
