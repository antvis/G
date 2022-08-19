import type { FederatedEvent } from '@antv/g';
import { DrawerTool } from '../constants/enum';
import type { Point } from '../interface/drawer';
import { BaseDrawer } from '../interface/drawer';
import { isInvalidRect } from '../utils/drawer';
import uuidv4 from '../utils/uuidv4';

const sortBboxPoint = (points: Point[]) => {
  const [tl, tr, bl, br] = points.concat().sort((a, b) => b.y - a.y);
  const t = [bl, br].sort((a, b) => a.x - b.x);
  const b = [tl, tr].sort((a, b) => b.x - a.x);
  return t.concat(b);
};
export class RectDrawer extends BaseDrawer {
  private start: { canvas: Point; viewport: Point } | undefined;
  private end: { canvas: Point; viewport: Point } | undefined;
  type = DrawerTool.Rect;

  get state() {
    if (!this.start || !this.end) return null;

    const tr = {
      canvas: this.canvas.viewport2Canvas({ x: this.end.viewport.x, y: this.start.viewport.y }),
      viewport: { x: this.end.viewport.x, y: this.start.viewport.y },
    };
    const bl = {
      canvas: this.canvas.viewport2Canvas({ x: this.start.viewport.x, y: this.end.viewport.y }),
      viewport: { x: this.start.viewport.x, y: this.end.viewport.y },
    };

    return {
      type: this.type,
      path: sortBboxPoint([this.start.canvas, tr.canvas, this.end.canvas, bl.canvas]),
      id: this.id,
      isDrawing: this.isDrawing,
    };
  }

  onMouseDown(e: FederatedEvent) {
    if (this.start) {
      this.onMouseUp(e);
      return;
    }
    this.isDrawing = true;
    this.start = { canvas: Object.assign({}, e.canvas), viewport: Object.assign({}, e.viewport) };
    this.end = { canvas: Object.assign({}, e.canvas), viewport: Object.assign({}, e.viewport) };
    this.id = uuidv4();
    this.emit('draw:start', this.state);
  }

  onMouseMove(e: FederatedEvent) {
    if (!this.isDrawing) return;
    this.end = { canvas: Object.assign({}, e.canvas), viewport: Object.assign({}, e.viewport) };
    this.emit('draw:modify', this.state);
  }

  onMouseUp(e: FederatedEvent) {
    if (!this.isDrawing) return;
    if (isInvalidRect(this.start.viewport, this.end.viewport, 2)) {
      this.emit('draw:cancel', this.state);
      this.reset();
      return;
    }
    this.isDrawing = false;
    this.emit('draw:complete', this.state);
    this.reset();
  }

  onMouseDbClick() {}

  onKeyDown() {}

  reset() {
    super.reset();
    this.start = undefined;
    this.end = undefined;
  }
}
