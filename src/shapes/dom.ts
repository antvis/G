import * as Util from '@antv/util';
import Shape from '../core/shape';
import * as Inside from './util/inside';
import BBox from '../core/bbox';

class Dom extends Shape {
  canFill: boolean = true;
  canStroke: boolean = true;
  type: string = 'dom';

  isPointInPath(x: number, y: number): boolean {
    if (!this.cfg.el) {
      return false;
    }
    const box = this.cfg.el.getBBox();
    return Inside.box(box.x, box.x + box.width, box.y, box.y + box.height, x, y);
  }

  calculateBox(): BBox {
    const self = this;
    const attrs = self.attrs;
    const x = attrs.x;
    const y = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    const lineWidth = this.getHitLineWidth();

    const halfWidth = lineWidth / 2;
    return new BBox(x - halfWidth, y - halfWidth, width, height);
  }
}

export default Dom;
