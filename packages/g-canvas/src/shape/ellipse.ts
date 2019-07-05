/**
 * @fileoverview ellipse
 * @author dengfuping_develop@163.com
 */

import * as mat3 from '@antv/gl-matrix/lib/gl-matrix/mat3';
import ShapeBase from './base';

class Ellipse extends ShapeBase {
  private type = 'ellipse';
  private canFill = true;
  private canStroke = true;

  public getDefaultAttrs() {
    const attrs = super.getDefaultAttrs();
    // 设置默认值
    return {
      ...attrs,
      x: 0,
      y: 0,
      rx: 1,
      ry: 1,
      lineWidth: 1,
    };
  }

  public getBBox() {
    const attrs = this.attr();
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;
    const lineWidth = this.getHitLineWidth();
    const halfXWidth = rx + lineWidth / 2;
    const halfYWidth = ry + lineWidth / 2;

    return {
      minX: cx - halfXWidth,
      minY: cy - halfYWidth,
      maxX: cx + halfXWidth,
      maxY: cy + halfYWidth,
      width: 2 * halfXWidth,
      height: 2 * halfYWidth,
    };
  }

  public createPath(context) {
    const attrs = this.attr();
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;

    const r = rx > ry ? rx : ry;
    const scaleX = rx > ry ? 1 : rx / ry;
    const scaleY = rx > ry ? ry / rx : 1;

    const m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    mat3.scale(m, m, [scaleX, scaleY]);
    mat3.translate(m, m, [cx, cy]);
    context.beginPath();
    context.save();
    context.transform(m[0], m[1], m[3], m[4], m[6], m[7]);
    context.arc(0, 0, r, 0, Math.PI * 2);
    context.restore();
    context.closePath();
  }
}

export default Ellipse;
