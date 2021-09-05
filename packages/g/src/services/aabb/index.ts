import { DisplayObject } from '../../DisplayObject';
import type { ParsedBaseStyleProps } from '../../types';

export const GeometryUpdaterFactory = 'GeometryUpdaterFactory';

export const GeometryAABBUpdater = 'GeometryAABBGenerator';
export interface GeometryAABBUpdater<T extends ParsedBaseStyleProps = any> {
  update: (
    parsedStyle: T,
    object: DisplayObject,
  ) => {
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
