import { FederatedPointerEvent, PointLike as Point } from '@antv/g-lite';

export type Direction = 'none' | 'left' | 'right' | 'down' | 'up';

export interface GestureEvent extends FederatedPointerEvent {
  points: Point[];
  direction: Direction;
  deltaX: number;
  deltaY: number;
  zoom: number;
  center: Point;
  velocity: number;
}

export interface EmitEventObject {
  type: string;
  ev: GestureEvent;
}

export interface evCacheObject {
  pointerId: number;
  x: number;
  y: number;
  ev: GestureEvent;
}

export interface GesturePluginOptions {
  isDocumentGestureEnabled: boolean;
}
