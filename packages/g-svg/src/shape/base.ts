import { AbstractShape } from '@antv/g-base';
import Defs from '../defs';
import { createDom, setShadow, setTransform, setClip } from '../util/svg';
import { SVG_ATTR_MAP } from '../constant';

class ShapeBase extends AbstractShape {
  type: string = 'svg';
  canFill: boolean = false;
  canStroke: boolean = false;
  cfg: {
    el: SVGAElement;
  };

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
    const el = this.get('el');
    const { x, y, width, height } = el.getBBox();
    const lineWidth = this.getHitLineWidth();
    const halfWidth = lineWidth / 2;
    const minX = x - halfWidth;
    const minY = y - halfWidth;
    const maxX = x + width + halfWidth;
    const maxY = y + height + halfWidth;
    return {
      x: minX,
      y: minY,
      minX,
      minY,
      maxX,
      maxY,
      width: width + lineWidth,
      height: height + lineWidth,
    };
  }

  isFill() {
    const { fill, fillStyle } = this.attr();
    return (fill || fillStyle || this.isClipShape()) && this.canFill;
  }

  isStroke() {
    const { stroke, strokeStyle } = this.attr();
    return (stroke || strokeStyle) && this.canStroke;
  }

  // 同 shape 中的方法重复了
  _applyClip(context, clip: ShapeBase) {
    if (clip) {
      clip.createPath(context);
      setClip(this, context);
    }
  }

  draw(context) {
    this._applyClip(context, this.getClip() as ShapeBase);
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
  }

  // stroke and fill
  strokeAndFill(context) {
    const { fill, fillStyle, stroke, strokeStyle, fillOpacity, strokeOpacity, lineWidth } = this.attr();
    const el = this.cfg.el;

    if (this.canFill) {
      // compatible with fillStyle
      this._setColor(context, 'fill', fill || fillStyle);
      el.setAttribute(SVG_ATTR_MAP['fillOpacity'], fillOpacity);
    }

    if (this.canStroke && lineWidth > 0) {
      // compatible with strokeStyle
      this._setColor(context, 'stroke', stroke || strokeStyle);
      el.setAttribute(SVG_ATTR_MAP['strokeOpacity'], strokeOpacity);
      el.setAttribute(SVG_ATTR_MAP['lineWidth'], lineWidth);
    }
  }

  _setColor(context, attr, value) {
    const el = this.get('el');
    if (!value) {
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

  shadow(context) {
    const { shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor } = this.attr();
    if (shadowOffsetX || shadowOffsetY || shadowBlur || shadowColor) {
      setShadow(this, context);
    }
  }

  transform() {
    const { matrix, rotate, transform } = this.attr();
    if (matrix || rotate || transform) {
      setTransform(this);
    }
  }

  /**
   * @protected
   * 绘制图形的路径
   * @param {Defs} context 上下文
   */
  createPath(context: Defs) {}

  isInShape(refX: number, refY: number): boolean {
    return this.isPointInPath(refX, refY);
  }

  isPointInPath(refX: number, refY: number): boolean {
    const el = this.get('el');
    const canvas = this.get('canvas');
    const bbox = canvas.cfg.el.getBoundingClientRect();
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
