import { Group } from '../Group';

export const EventService = Symbol('EventService');
export interface EventService {
  init(root: Group): Promise<void> | void;
  destroy(): Promise<void> | void;
  pick(position: { x: number; y: number }): Group | null;
}
