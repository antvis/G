import { DrawerTool } from '../constants/enum';
import type { Point } from '../interface/drawer';
import { BaseDrawer } from '../interface/drawer';
import { isNearPoint } from '../utils/drawer';
import uuidv4 from '../utils/uuidv4';

export class RectDrawer extends BaseDrawer {
  private start: Point | undefined;
  private end: Point | undefined;
  type = DrawerTool.Rect;

  get state() {
    if (!this.start || !this.end) return null;
    return {
      type: this.type,
      path: [
        this.start,
        { x: this.end.x, y: this.start.y },
        this.end,
        { x: this.start.x, y: this.end.y },
      ],
      width: this.end.x - this.start.x,
      height: this.end.y - this.start.y,
      id: this.id,
      isDrawing: this.isDrawing,
    };
  }

  onMouseDown(e) {
    if (this.start) {
      this.reset();
    }
    this.isDrawing = true;
    this.start = { x: e.x, y: e.y };
    this.end = { x: e.x, y: e.y };
    this.id = uuidv4();
    this.emit('draw:start', this.state);
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    this.end = { x: e.x, y: e.y };
    this.emit('draw:modify', this.state);
  }

  onMouseUp(e) {
    if (!this.isDrawing) return;
    if (isNearPoint(this.start, this.end, 2)) {
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
