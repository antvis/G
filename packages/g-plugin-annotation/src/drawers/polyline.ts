import type { FederatedEvent } from '@antv/g-lite';
import { DrawerEvent, DrawerTool } from '../constants/enum';
import { BaseDrawer } from '../interface/drawer';
import { isNearPoint } from '../utils/drawer';
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

  onMouseDown(e: FederatedEvent) {
    const currentPoint = { x: e.canvas.x, y: e.canvas.y };
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.id = uuidv4();
      this.path = [currentPoint, currentPoint];
      this.emit(DrawerEvent.START, this.state);
    } else {
      this.path.push(currentPoint);
      const lastPoint = this.path[this.path.length - 3];
      if (isNearPoint(lastPoint, currentPoint, 8)) {
        // remove last moving point
        this.path.pop();
        this.closePath();
        return;
      }
      this.emit(DrawerEvent.MODIFIED, this.state);
    }
  }

  onMouseMove(e: FederatedEvent) {
    if (!this.isDrawing) return;
    this.path[this.path.length - 1] = { x: e.canvas.x, y: e.canvas.y };
    this.emit(DrawerEvent.MOVE, this.state);
  }

  onMouseUp() {}

  onMouseDbClick(e: FederatedEvent) {
    this.onMouseDown(e);
    this.closePath();
  }

  /**
   * esc -> 取消
   * space -> 结束
   * ctrl+z -> 撤销
   * @param e
   */

  onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Escape') {
      this.emit(DrawerEvent.CANCEL, this.state);
      this.reset();
      e.stopPropagation();
    }

    if (e.code === 'KeyZ' && e.ctrlKey) {
      if (this.path.length === 1) {
        this.emit(DrawerEvent.CANCEL, this.state);
        this.reset();
      } else {
        this.path.pop();
        this.emit(DrawerEvent.MODIFIED, this.state);
      }
      e.stopPropagation();
    }

    if (e.code === 'Space') {
      this.closePath();
      e.stopPropagation();
    }
  }

  closePath() {
    this.path.pop();
    this.isDrawing = false;
    this.emit(DrawerEvent.COMPLETE, this.state);
    this.reset();
  }

  reset() {
    super.reset();
  }
}
