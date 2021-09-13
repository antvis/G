import { Group } from '../display-objects';
import { AABB } from '../shapes';

/**
 * why we need re-render
 */
export enum RENDER_REASON {
  CameraChanged,
  DisplayObjectChanged,
  DisplayObjectRemoved,
  None,
}
export const RenderingContext = 'RenderingContext';
export interface RenderingContext {
  /**
   * root of scenegraph
   */
  root: Group;

  /**
   * force rendering at next frame
   */
  force: boolean;

  removedAABBs: AABB[];

  /**
   * reason of re-render, reset after every renderred frame
   */
  renderReasons: Set<RENDER_REASON>;

  dirty: boolean;
}
