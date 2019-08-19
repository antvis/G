import * as Util from '@antv/util';
import * as arcUtil from './math/arc';
import Shape from '../core/shape';
import * as Inside from './util/inside';
import BBox from '../core/bbox';
import { box } from './math/arc';

class Fan extends Shape {
  canFill: boolean = true;
  canStroke: boolean = true;
  type: string = 'fan';

  getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      rs: 0,
      re: 0,
      startAngle: 0,
      endAngle: 0,
      clockwise: false,
      lineWidth: 1
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const self = this;
    const fill = self.hasFill();
    const stroke = self.hasStroke();
    const attrs = self.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rs = attrs.rs;
    const re = attrs.re;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;
    const v1 = [ 1, 0 ];
    const subv = [ x - cx, y - cy ];
    const angle = Util.vec2.angleTo(v1, subv);

    function _isPointInFill() {
      const angle1 = arcUtil.nearAngle(angle, startAngle, endAngle, clockwise);

      if (Util.isNumberEqual(angle, angle1)) {
        const ls = Util.vec2.squaredLength(subv);
        if (rs * rs <= ls && ls <= re * re) {
          return true;
        }
      }
      return false;
    }

    function _isPointInStroke(): boolean {
      const lineWidth = self.getHitLineWidth();

      const ssp = {
        x: Math.cos(startAngle) * rs + cx,
        y: Math.sin(startAngle) * rs + cy
      };
      const sep = {
        x: Math.cos(startAngle) * re + cx,
        y: Math.sin(startAngle) * re + cy
      };
      const esp = {
        x: Math.cos(endAngle) * rs + cx,
        y: Math.sin(endAngle) * rs + cy
      };
      const eep = {
        x: Math.cos(endAngle) * re + cx,
        y: Math.sin(endAngle) * re + cy
      };

      if (Inside.line(ssp.x, ssp.y, sep.x, sep.y, lineWidth, x, y)) {
        return true;
      }

      if (Inside.line(esp.x, esp.y, eep.x, eep.y, lineWidth, x, y)) {
        return true;
      }

      if (Inside.arcline(cx, cy, rs, startAngle, endAngle, clockwise, lineWidth, x, y)) {
        return true;
      }

      if (Inside.arcline(cx, cy, re, startAngle, endAngle, clockwise, lineWidth, x, y)) {
        return true;
      }

      return false;
    }

    if (fill && stroke) {
      return _isPointInFill() || _isPointInStroke();
    }

    if (fill) {
      return _isPointInFill();
    }

    if (stroke) {
      return _isPointInStroke();
    }
    return false;
  }

  calculateBox(): BBox {
    const self = this;
    const attrs = self.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rs = attrs.rs;
    const re = attrs.re;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;
    const lineWidth = this.getHitLineWidth();

    const boxs = box(cx, cy, rs, startAngle, endAngle, clockwise);
    const boxe = box(cx, cy, re, startAngle, endAngle, clockwise);
    const minX = Math.min(boxs.minX, boxe.minX);
    const minY = Math.min(boxs.minY, boxe.minY);
    const maxX = Math.max(boxs.maxX, boxe.maxX);
    const maxY = Math.max(boxs.maxY, boxe.maxY);

    const halfWidth = lineWidth / 2;
    return BBox.fromRange(
      minX - halfWidth,
      minY - halfWidth,
      maxX + halfWidth,
      maxY + halfWidth
    );
  }

  createPath(context: CanvasRenderingContext2D): void {
    const self = this;
    const attrs = self.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rs = attrs.rs;
    const re = attrs.re;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;

    const ssp = {
      x: Math.cos(startAngle) * rs + cx,
      y: Math.sin(startAngle) * rs + cy
    };
    const sep = {
      x: Math.cos(startAngle) * re + cx,
      y: Math.sin(startAngle) * re + cy
    };
    const esp = {
      x: Math.cos(endAngle) * rs + cx,
      y: Math.sin(endAngle) * rs + cy
    };

    context = context || self.get('context');
    context.beginPath();
    context.moveTo(ssp.x, ssp.y);
    context.lineTo(sep.x, sep.y);
    context.arc(cx, cy, re, startAngle, endAngle, clockwise);
    context.lineTo(esp.x, esp.y);
    context.arc(cx, cy, rs, endAngle, startAngle, !clockwise);
    context.closePath();
  }
}

export default Fan;
