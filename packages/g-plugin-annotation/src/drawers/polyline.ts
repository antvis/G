import { DrawerTool } from '../constants/enum';
import { BaseDrawer } from '../interface/drawer';
import uuidv4 from '../utils/uuidv4';

export class PolylineDrawer extends BaseDrawer {
  type = DrawerTool.Polyline;

  get state() {
    return {
      type: this.type,
      path: this.path,
      isDrawing: this.isDrawing,
      id: this.id,
    };
  }

  onMouseDown(e) {
    const point = { x: e.canvas.x, y: e.canvas.y };
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.id = uuidv4();
      this.path = [point, point];
      this.onStart(this.state);
    } else {
      this.path.push(point);
      this.onChange(this.state);
    }
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    this.path[this.path.length - 1] = { x: e.canvas.x, y: e.canvas.y };
    this.onChange(this.state);
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
      this.onCancel(this.state);
      this.reset();
    }

    if (e.code === 'KeyZ' && e.ctrlKey) {
      if (this.path.length === 1) {
        this.onCancel(this.state);
        this.reset();
      } else {
        this.path.pop();
        this.onChange(this.state);
      }
      this.onChange(this.state);
      e.stopPropagation();
    }

    if (e.code === 'Space') {
      this.closePath();
    }
  }

  closePath() {
    this.isDrawing = false;
    this.onComplete(this.state);
    this.reset();
  }

  reset() {
    super.reset();
  }
}
