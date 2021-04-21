import { DisplayObject } from '../DisplayObject';

export const EventService = Symbol('EventService');
export interface EventService {
  init(root: DisplayObject): Promise<void> | void;
  destroy(): Promise<void> | void;
  pick(position: { x: number; y: number }): DisplayObject | null;
}
