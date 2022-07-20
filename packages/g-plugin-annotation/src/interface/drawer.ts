import type { FederatedEvent } from '@antv/g';
import type { DrawerTool } from '../constants/enum';
import type { AnnotationType, Point } from './annotation';
import EventEmitter from 'eventemitter3';

export interface DrawerState {
  type: AnnotationType;
  isDrawing: boolean;
  path: Point[];
  id: string;
}

export interface DrawerOption {}

export abstract class BaseDrawer extends EventEmitter {
  /** 当前标注的id */
  id: string | undefined;
  /** 标注类型 */
  abstract type: DrawerTool;
  /** 构造参数 */
  drawerOptions: DrawerOption;
  /** 是否正在绘制 */
  isDrawing: boolean = false;
  /** 绘制激活 */
  isActive: boolean = true;
  /** 绘制路径 */
  path: Point[] = [];
  /** 标签 */
  tag: string;

  constructor(drawerOptions: DrawerOption) {
    super();
    this.drawerOptions = drawerOptions;
  }

  public addEventListener(eventName: string, fn: (...args: any[]) => void) {
    return this.on(eventName, fn);
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

  dispose() {
    this.reset();
  }
}
