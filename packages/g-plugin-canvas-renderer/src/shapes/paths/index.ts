import type { BaseStyleProps } from '@antv/g';

export const PathGeneratorFactory = Symbol('PathGeneratorFactory');
export const PathGenerator = Symbol('Path');

/**
 * generate path in local space
 */
export type PathGenerator<T extends BaseStyleProps> = (
  context: CanvasRenderingContext2D,
  attributes: T,
) => void;

export { generatePath as CirclePath } from './Circle';
export { generatePath as EllipsePath } from './Ellipse';
export { generatePath as RectPath } from './Rect';
export { generatePath as LinePath } from './Line';
export { generatePath as PolylinePath } from './Polyline';
export { generatePath as PolygonPath } from './Polygon';
export { generatePath as PathPath } from './Path';
