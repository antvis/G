import type { FederatedEvent } from '@antv/g-lite';
import { DrawerEvent, DrawerTool } from '../constants/enum';
import { BaseDrawer } from '../interface/drawer';
import { isNearPoint } from '../utils/drawer';
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

  onMouseDown(e: FederatedEvent) {
    const point = { x: e.canvas.x, y: e.canvas.y };
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.id = uuidv4();
      this.path = [point, point];
      this.emit(DrawerEvent.START, this.state);
    } else {
      const startPoint = this.path[0];
      if (isNearPoint(point, startPoint, 8)) {
        this.closePath();
      } else {
        this.path.push(point);
        this.emit(DrawerEvent.MODIFIED, this.state);
      }
    }
  }

  onMouseMove(e: FederatedEvent) {
    if (!this.isDrawing) return;
    this.path[this.path.length - 1] = { x: e.canvas.x, y: e.canvas.y };
    this.emit(DrawerEvent.MOVE, this.state);
  }

  onMouseUp() {}

  /**
   * esc -> 取消
   * space -> 闭合
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
      if (this.path.length > 3) {
        this.closePath();
        e.stopPropagation();
      }
    }
  }

  onMouseDbClick(): void {}

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
