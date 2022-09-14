import type { Canvas, FederatedEvent } from '@antv/g-lite';
import EventEmitter from 'eventemitter3';
import type { DrawerTool } from '../constants/enum';

export type DrawerType = 'circle' | 'rect' | 'polyline' | 'polygon';

/**
 * TODO: make drawer style configurable
 */
export interface DrawerStyle {}

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
  /** 画布 */
  canvas: Canvas;

  constructor(drawerOptions: DrawerOption) {
    super();
    this.drawerOptions = drawerOptions;
  }

  abstract onMouseDown(e: FederatedEvent): void;
  abstract onMouseMove(e: FederatedEvent): void;
  abstract onMouseUp(e: FederatedEvent): void;
  abstract onMouseDbClick(e: FederatedEvent): void;
  abstract onKeyDown(e: KeyboardEvent): void;

  setCanvas(canvas: Canvas) {
    this.canvas = canvas;
  }

  reset() {
    this.id = undefined;
    this.isDrawing = false;
    this.path = [];
  }

  dispose() {
    this.reset();
  }
}
