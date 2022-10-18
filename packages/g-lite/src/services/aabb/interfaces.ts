import type { DisplayObject } from '../../display-objects/DisplayObject';
import type { ParsedBaseStyleProps } from '../../types';
export interface GeometryAABBUpdater<T extends ParsedBaseStyleProps = any> {
  update: (
    parsedStyle: T,
    object: DisplayObject,
  ) => {
    width: number;
    height: number;
    depth?: number;
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
  };
}
