import type { FederatedEvent } from '@antv/g';
import { DrawerTool } from '../constants/enum';
import { BaseDrawer } from '../interface/drawer';
import uuidv4 from '../utils/uuidv4';

export class CircleDrawer extends BaseDrawer {
  type = DrawerTool.Circle;

  get state() {
    return {
      type: this.type,
      path: this.path,
      id: this.id,
    };
  }
  onMouseDown(e: FederatedEvent) {
    this.path = [{ x: e.canvas.x, y: e.canvas.y }];
    this.id = uuidv4();
    this.emit('draw:start', this.state);
    this.emit('draw:complete', this.state);
  }

  onMouseMove() {}

  onMouseUp(e) {
    // exclude drag event
    // if (this.isActive) {
    //   this.emit('draw:complete', this.state);
    // }
  }
  onMouseDbClick(): void {}
  onKeyDown() {}

  reset() {
    super.reset();
  }
}
