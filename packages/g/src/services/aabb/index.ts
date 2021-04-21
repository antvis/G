import { AABB } from '../../shapes';
import { ShapeAttrs } from '../../types';

export const GeometryAABBUpdater = Symbol('GeometryAABBGenerator');
export interface GeometryAABBUpdater {
  dependencies: string[];
  update(attributes: ShapeAttrs, aabb: AABB): void;
}

export { CircleUpdater } from './CircleUpdater';
export { EllipseUpdater } from './EllipseUpdater';
export { RectUpdater } from './RectUpdater';
