import { DrawerTool } from '../constants/enum';
import { BaseDrawer } from '../interface/drawer';
import { isInvalidRect } from '../utils/drawer';
import uuidv4 from '../utils/uuidv4';

export class PolygonDrawer extends BaseDrawer {
  type = DrawerTool.Polygon;

  get state() {
    return {
      type: this.type,
      path: this.path,
      id: this.id,
    };
  }

  onMouseDown(e) {
    const point = { x: e.canvas.x, y: e.canvas.y };
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.id = uuidv4();
      this.path = [point, point];
      this.emit('draw:start', this.state);
    } else {
      const startPoint = this.path[0];
      if (isInvalidRect(point, startPoint, 10)) {
        this.closePath();
      } else {
        this.path.push(point);
        this.emit('draw:modify', this.state);
      }
    }
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    this.path[this.path.length - 1] = { x: e.canvas.x, y: e.canvas.y };
    this.emit('draw:move', this.state);
  }

  onMouseUp() {}

  /**
   * esc -> 取消
   * space -> 闭合
   * ctrl+z -> 撤销
   * @param e
   */

  onKeyDown(e) {
    if (e.code === 'Escape') {
      this.emit('draw:cancel', this.state);
      this.reset();
    }

    if (e.code === 'KeyZ' && e.ctrlKey) {
      if (this.path.length === 1) {
        this.emit('draw:cancel', this.state);
        this.reset();
      } else {
        this.path.pop();
        this.emit('draw:modify', this.state);
      }
      e.stopPropagation();
    }

    if (e.code === 'Space') {
      if (this.path.length > 3) {
        this.closePath();
      }
    }
  }

  onMouseDbClick(): void {}

  closePath() {
    this.path.pop();
    this.isDrawing = false;
    this.emit('draw:complete', this.state);
    this.reset();
  }

  reset() {
    super.reset();
  }
}
