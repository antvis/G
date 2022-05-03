import { Syringe } from 'mana-syringe';
import type { Group } from '../display-objects';

/**
 * why we need re-render
 */
export enum RenderReason {
  CAMERA_CHANGED,
  DISPLAY_OBJECT_CHANGED,
  NONE,
}
export const RenderingContext = Syringe.defineToken('RenderingContext');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface RenderingContext {
  /**
   * root of scenegraph
   */
  root: Group;

  /**
   * force rendering at next frame
   */
  force: boolean;

  /**
   * reason of re-render, reset after every renderred frame
   */
  renderReasons: Set<RenderReason>;

  dirty: boolean;
}
