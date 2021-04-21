import { Entity } from '@antv/g-ecs';

export const PathGenerator = Symbol('Path');
export type PathGenerator = (context: CanvasRenderingContext2D, entity: Entity) => void;

export { generatePath as CirclePath } from './Circle';
export { generatePath as EllipsePath } from './Ellipse';
export { generatePath as RectPath } from './Rect';
export { generatePath as LinePath } from './Line';
export { generatePath as PolylinePath } from './Polyline';
export { generatePath as PolygonPath } from './Polygon';
