import { AABB } from '../../shapes';
import { ShapeAttrs } from '../../types';

export const GeometryUpdaterFactory = Symbol('GeometryUpdaterFactory');

export const GeometryAABBUpdater = Symbol('GeometryAABBGenerator');
export interface GeometryAABBUpdater {
  dependencies: string[];
  update(attributes: ShapeAttrs, aabb: AABB): void;
}

export { CircleUpdater } from './CircleUpdater';
export { EllipseUpdater } from './EllipseUpdater';
export { RectUpdater } from './RectUpdater';
export { TextUpdater } from './TextUpdater';
export { LineUpdater } from './LineUpdater';
export { PolylineUpdater } from './PolylineUpdater';
export { PathUpdater } from './PathUpdater';
