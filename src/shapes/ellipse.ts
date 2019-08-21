import * as Util from '@antv/util';
import Shape from '../core/shape';
import * as Inside from './util/inside';
import BBox from '../core/bbox';

class Ellipse extends Shape {
  canFill: boolean = true;
  canStroke: boolean = true;
  type: string = 'ellipse';

  getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      rx: 1,
      ry: 1,
      lineWidth: 1,
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const attrs = this.attrs;
    const fill = this.hasFill();
    const stroke = this.hasStroke();
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;
    const lineWidth = this.getHitLineWidth();
    const r = rx > ry ? rx : ry;
    const scaleX = rx > ry ? 1 : rx / ry;
    const scaleY = rx > ry ? ry / rx : 1;
    const p = [x, y, 1];
    const m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    Util.mat3.scale(m, m, [scaleX, scaleY]);
    Util.mat3.translate(m, m, [cx, cy]);
    const inm = Util.mat3.invert([], m);
    Util.vec3.transformMat3(p, p, inm);

    if (fill && stroke) {
      return (
        Inside.circle(0, 0, r, p[0], p[1]) || Inside.arcline(0, 0, r, 0, Math.PI * 2, false, lineWidth, p[0], p[1])
      );
    }

    if (fill) {
      return Inside.circle(0, 0, r, p[0], p[1]);
    }

    if (stroke) {
      return Inside.arcline(0, 0, r, 0, Math.PI * 2, false, lineWidth, p[0], p[1]);
    }
    return false;
  }

  calculateBox(): BBox {
    const attrs = this.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;
    const lineWidth = this.getHitLineWidth();
    const halfXWidth = rx + lineWidth / 2;
    const halfYWidth = ry + lineWidth / 2;
    return BBox.fromRange(cx - halfXWidth, cy - halfYWidth, cx + halfXWidth, cy + halfYWidth);
  }

  createPath(context: CanvasRenderingContext2D): void {
    const self = this;
    const attrs = this.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;

    context = context || self.get('context');
    const r = rx > ry ? rx : ry;
    const scaleX = rx > ry ? 1 : rx / ry;
    const scaleY = rx > ry ? ry / rx : 1;

    const m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    Util.mat3.scale(m, m, [scaleX, scaleY]);
    Util.mat3.translate(m, m, [cx, cy]);
    context.beginPath();
    context.save();
    context.transform(m[0], m[1], m[3], m[4], m[6], m[7]);
    context.arc(0, 0, r, 0, Math.PI * 2);
    context.restore();
    context.closePath();
  }
}

export default Ellipse;
