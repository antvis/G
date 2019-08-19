import * as Util from '@antv/util';
import * as Format from '../../util/format';
import Shape from '../../core/shape';
import PathSegment from '../util/path-segment';
import * as Inside from '../util/inside';
import BBox from '../../core/bbox';

import symbolsFactory from './symbols';

class Marker extends Shape {
  type: string = 'marker';
  canFill: boolean = true;
  canStroke: boolean = true;

  // 作为其静态属性
  public static symbolsFactory = symbolsFactory;

  getDefaultAttrs() {
    return {
      path: null,
      x: 0,
      y: 0,
      lineWidth: 1
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const attrs = this.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.radius;
    const lineWidth = this.getHitLineWidth();
    return Inside.circle(cx, cy, r + lineWidth / 2, x, y);
  }

  calculateBox(): BBox {
    const attrs = this.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.radius;
    const lineWidth = this.getHitLineWidth();
    const halfWidth = lineWidth / 2 + r;
    return BBox.fromRange(
      cx - halfWidth,
      cy - halfWidth,
      cx + halfWidth,
      cy + halfWidth
    );
  }

  _getPath(): any[] {
    const attrs = this.attrs;
    const x = attrs.x;
    const y = attrs.y;
    const r = attrs.radius;
    const symbol = attrs.symbol || 'circle';
    let method;
    if (Util.isFunction(symbol)) {
      method = symbol;
    } else {
      method = symbolsFactory.get(symbol);
    }

    if (!method) { // 容错，防止绘制出错
      console.warn(`${method} symbol is not exist.`);
      return null;
    }
    return method(x, y, r);
  }

  createPath(context: CanvasRenderingContext2D): void {
    let segments = this.cfg.segments;
    if (segments && !this.cfg.hasUpdate) {
      context.beginPath();
      for (let i = 0; i < segments.length; i++) {
        segments[i].draw(context);
      }
      return;
    }

    const path = Format.parsePath(this._getPath());
    context.beginPath();
    let preSegment;
    segments = [];
    for (let i = 0; i < path.length; i++) {
      const item = path[i];
      preSegment = new PathSegment(item, preSegment, i === path.length - 1);
      segments.push(preSegment);
      preSegment.draw(context);
    }
    this.cfg.segments = segments;
    this.cfg.hasUpdate = false;
  }
}

export default Marker;
