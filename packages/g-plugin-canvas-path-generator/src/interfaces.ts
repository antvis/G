import type { DisplayObject } from '@antv/g-lite';

/**
 * generate path in local space
 */
export type PathGenerator<T extends DisplayObject> = (
  context: CanvasRenderingContext2D,
  object: T,
) => void;
