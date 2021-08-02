import type { AABB } from '../../shapes';
import type { BaseStyleProps } from '../../types';

export const GeometryUpdaterFactory = Symbol('GeometryUpdaterFactory');

export const GeometryAABBUpdater = Symbol('GeometryAABBGenerator');
export interface GeometryAABBUpdater<T extends BaseStyleProps = any> {
  dependencies: string[];
  update: (attributes: T, aabb: AABB) => void;
}

export { CircleUpdater } from './CircleUpdater';
export { EllipseUpdater } from './EllipseUpdater';
export { RectUpdater } from './RectUpdater';
export { TextUpdater } from './TextUpdater';
export { LineUpdater } from './LineUpdater';
export { PolylineUpdater } from './PolylineUpdater';
export { PathUpdater } from './PathUpdater';
