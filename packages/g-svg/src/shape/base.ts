import { AbstractShape, BBox } from '@antv/g-base';
import { ShapeAttrs, ChangeType } from '@antv/g-base/lib/types';
import { ISVGShape } from '../interfaces';
import Defs from '../defs';
import { setShadow, setTransform, setClip } from '../util/svg';
import { createDom } from '../util/dom';
import { refreshElement } from '../util/draw';
import { SVG_ATTR_MAP } from '../constant';

class ShapeBase extends AbstractShape implements ISVGShape {
  type: string = 'svg';
  canFill: boolean = false;
  canStroke: boolean = false;

  getDefaultAttrs() {
    const attrs = super.getDefaultAttrs();
    // 设置默认值
    attrs['lineWidth'] = 1;
    attrs['lineAppendWidth'] = 0;
    attrs['strokeOpacity'] = 1;
    attrs['fillOpacity'] = 1;
    return attrs;
  }

  // 覆盖基类的 afterAttrsChange 方法
  afterAttrsChange(targetAttrs: ShapeAttrs) {
    super.afterAttrsChange(targetAttrs);
    const canvas = this.get('canvas');
    const context = canvas.get('context');
    this.updatePath(context, targetAttrs);
  }

  /**
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType) {
    refreshElement(this, changeType);
  }

  calculateBBox(): BBox {
    const el = this.get('el');
    const { x, y, width, height } = el.getBBox();
    const lineWidth = this.getHitLineWidth();
    const halfWidth = lineWidth / 2;
    const minX = x - halfWidth;
    const minY = y - halfWidth;
    const maxX = x + width + halfWidth;
    const maxY = y + height + halfWidth;
    return BBox.fromRange(minX, minY, maxX, maxY);
  }

  isFill() {
    const { fill, fillStyle } = this.attr();
    return (fill || fillStyle || this.isClipShape()) && this.canFill;
  }

  isStroke() {
    const { stroke, strokeStyle } = this.attr();
    return (stroke || strokeStyle) && this.canStroke;
  }

  applyClip(context) {
    setClip(this, context);
  }

  draw(context) {
    this.applyClip(context);
    this.drawPath(context);
  }

  /**
   * 绘制图形的路径
   * @param {Defs} context 上下文
   */
  drawPath(context: Defs) {
    createDom(this);
    this.createPath(context);
    this.shadow(context);
    this.strokeAndFill(context);
    this.transform();
  }

  /**
   * 更新图形的路径
   * @param {Defs} context 上下文
   * @param {ShapeAttrs} targetAttrs 渲染的目标属性
   */
  updatePath(context: Defs, targetAttrs: ShapeAttrs) {
    this.createPath(context, targetAttrs);
    this.shadow(context, targetAttrs);
    this.strokeAndFill(context, targetAttrs);
    this.transform(targetAttrs);
  }

  /**
   * @protected
   * 绘制图形的路径
   * @param {Defs} context 上下文
   * @param {ShapeAttrs} targetAttrs 渲染的目标属性
   */
  createPath(context: Defs, targetAttrs?: ShapeAttrs) {}

  // stroke and fill
  strokeAndFill(context, targetAttrs?) {
    const attrs = this.attr();
    const { fill, fillStyle, stroke, strokeStyle, fillOpacity, strokeOpacity, lineWidth } = targetAttrs || attrs;
    const el = this.get('el');

    if (this.canFill) {
      // compatible with fillStyle
      if (fill || fillStyle || !targetAttrs) {
        this._setColor(context, 'fill', fill || fillStyle);
      }
      if (fillOpacity) {
        el.setAttribute(SVG_ATTR_MAP['fillOpacity'], fillOpacity);
      }
    }

    if (this.canStroke && lineWidth > 0) {
      // compatible with strokeStyle
      if (stroke || strokeStyle || !targetAttrs) {
        this._setColor(context, 'stroke', stroke || strokeStyle);
      }
      if (strokeOpacity) {
        el.setAttribute(SVG_ATTR_MAP['strokeOpacity'], strokeOpacity);
      }
      if (lineWidth) {
        el.setAttribute(SVG_ATTR_MAP['lineWidth'], lineWidth);
      }
    }
  }

  _setColor(context, attr, value) {
    const el = this.get('el');
    if (!value) {
      // need to set `none` to avoid default value
      el.setAttribute(SVG_ATTR_MAP[attr], 'none');
      return;
    }
    value = value.trim();
    if (/^[r,R,L,l]{1}[\s]*\(/.test(value)) {
      let id = context.find('gradient', value);
      if (!id) {
        id = context.addGradient(value);
      }
      el.setAttribute(SVG_ATTR_MAP[attr], `url(#${id})`);
    } else if (/^[p,P]{1}[\s]*\(/.test(value)) {
      let id = context.find('pattern', value);
      if (!id) {
        id = context.addPattern(value);
      }
      el.setAttribute(SVG_ATTR_MAP[attr], `url(#${id})`);
    } else {
      el.setAttribute(SVG_ATTR_MAP[attr], value);
    }
  }

  shadow(context, targetAttrs?) {
    const attrs = this.attr();
    const { shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor } = targetAttrs || attrs;
    if (shadowOffsetX || shadowOffsetY || shadowBlur || shadowColor) {
      setShadow(this, context);
    }
  }

  transform(targetAttrs?) {
    const attrs = this.attr();
    const { matrix } = targetAttrs || attrs;
    if (matrix) {
      setTransform(this);
    }
  }

  isInShape(refX: number, refY: number): boolean {
    return this.isPointInPath(refX, refY);
  }

  isPointInPath(refX: number, refY: number): boolean {
    const el = this.get('el');
    const canvas = this.get('canvas');
    const bbox = canvas.get('el').getBoundingClientRect();
    const clientX = refX + bbox.left;
    const clientY = refY + bbox.top;
    const element = document.elementFromPoint(clientX, clientY);
    if (element && element.isEqualNode(el)) {
      return true;
    }
    return false;
  }

  /**
   * 获取线拾取的宽度
   * @returns {number} 线的拾取宽度
   */
  getHitLineWidth() {
    const { lineWidth, lineAppendWidth } = this.attrs;
    if (this.isStroke()) {
      return lineWidth + lineAppendWidth;
    }
    return 0;
  }
}

export default ShapeBase;
