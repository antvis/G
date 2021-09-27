import { DisplayObject } from '../../display-objects/DisplayObject';
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
