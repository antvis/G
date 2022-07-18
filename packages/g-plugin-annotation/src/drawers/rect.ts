import uuidv4 from '../utils/uuidv4';
import type { Point } from '../interface/annotation';
import { DrawerTool } from '../constants/enum';
import { BaseDrawer } from '../interface/drawer';

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
    };
  }

  onMouseDown(e) {
    if (this.start) {
      this.reset();
    }
    this.isDrawing = true;
    this.start = { x: e.canvas.x, y: e.canvas.y };
    this.end = { x: e.canvas.x, y: e.canvas.y };
    this.id = uuidv4();
    this.onStart(this.state);
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    this.end = { x: e.canvas.x, y: e.y };
    this.onChange(this.state);
  }

  onMouseUp(e) {
    if (!this.isDrawing) return;
    this.onComplete(this.state);
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
