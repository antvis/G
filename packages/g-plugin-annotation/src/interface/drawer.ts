import type { FederatedEvent } from '@antv/g';
import type { DrawerTool } from '../constants/enum';
import type { AnnotationType, Point } from './annotation';

export interface DrawerState {
  type: AnnotationType;
  isDrawing: boolean;
  path: Point[];
  id: string;
}

export interface DrawerOption {
  onStart?: Function;
  onChange?: Function;
  onComplete?: Function;
  onCancel?: Function;
}

export abstract class BaseDrawer {
  id: string | undefined;
  abstract type: DrawerTool;
  isDrawing: boolean = false;
  isActive: boolean = false;
  path: Point[] = [];
  drawerOptions: DrawerOption;
  onStart: Function = () => {};
  onChange: Function = () => {};
  onComplete: Function = () => {};
  onCancel: Function = () => {};

  constructor(drawerOptions: DrawerOption) {
    this.drawerOptions = drawerOptions;
    this.assignEvents();
  }

  private assignEvents() {
    Object.entries(this.drawerOptions).forEach(([key, fn]) => {
      if (typeof fn === 'function') {
        this[key] = fn;
      }
    });
  }

  abstract onMouseDown(e: FederatedEvent): void;
  abstract onMouseMove(e: FederatedEvent): void;
  abstract onMouseUp(e: FederatedEvent): void;
  abstract onMouseDbClick(e: FederatedEvent): void;
  abstract onKeyDown(e: KeyboardEvent): void;

  reset() {
    this.id = undefined;
    this.isDrawing = false;
    this.path = [];
  }
}
