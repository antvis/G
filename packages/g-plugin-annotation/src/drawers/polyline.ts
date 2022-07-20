import { DrawerTool } from '../constants/enum';
import { BaseDrawer } from '../interface/drawer';
import uuidv4 from '../utils/uuidv4';
import { isNearPoint } from '../utils/drawer';

export class PolylineDrawer extends BaseDrawer {
  type = DrawerTool.Polyline;

  get state() {
    return {
      type: this.type,
      path: this.path,
      isDrawing: this.isDrawing,
      id: this.id,
      tag: this.tag,
    };
  }

  onMouseDown(e) {
    const currentPoint = { x: e.canvas.x, y: e.canvas.y };
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.id = uuidv4();
      this.path = [currentPoint, currentPoint];
      this.emit('draw:start', this.state);
    } else {
      const lastPoint = this.path[this.path.length - 2];

      if (isNearPoint(lastPoint, currentPoint, 10)) {
        this.closePath();
        return;
      }

      this.path.push(currentPoint);
      this.emit('draw:modify', this.state);
    }
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    this.path[this.path.length - 1] = { x: e.canvas.x, y: e.canvas.y };
    this.emit('draw:modify', this.state);
  }

  onMouseUp() {}

  onMouseDbClick(e) {
    this.onMouseDown(e);
    this.closePath();
  }

  /**
   * esc -> 取消
   * space -> 结束
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
      this.closePath();
    }
  }

  closePath() {
    this.isDrawing = false;
    this.emit('draw:complete', this.state);
    this.reset();
  }

  reset() {
    super.reset();
  }
}
