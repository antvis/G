import EventEmitter from 'eventemitter3';
import type { DrawerTool } from '../constants/enum';

export type DrawerType = 'circle' | 'rect' | 'polyline' | 'polygon';
export interface DrawerState {
  type: DrawerType;
  id: string;
  path: DrawerPath;
}

export interface Point {
  x: number;
  y: number;
}
export type DrawerPath = Point[];
export interface DrawerState {
  type: DrawerType;
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

  constructor(drawerOptions: DrawerOption) {
    super();
    this.drawerOptions = drawerOptions;
  }

  abstract onMouseDown(e): void;
  abstract onMouseMove(e): void;
  abstract onMouseUp(e): void;
  abstract onMouseDbClick(e): void;
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
