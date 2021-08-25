import type { ParsedBaseStyleProps } from '../../types';

export const GeometryUpdaterFactory = Symbol('GeometryUpdaterFactory');

export const GeometryAABBUpdater = Symbol('GeometryAABBGenerator');
export interface GeometryAABBUpdater<T extends ParsedBaseStyleProps = any> {
  update: (parsedStyle: T) => {
    width: number;
    height: number;
    depth?: number;
    x: number;
    y: number;
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
  };
}

export { CircleUpdater } from './CircleUpdater';
export { EllipseUpdater } from './EllipseUpdater';
export { RectUpdater } from './RectUpdater';
export { TextUpdater } from './TextUpdater';
export { LineUpdater } from './LineUpdater';
export { PolylineUpdater } from './PolylineUpdater';
export { PathUpdater } from './PathUpdater';
