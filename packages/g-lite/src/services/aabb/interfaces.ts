import type { DisplayObject } from '../../display-objects/DisplayObject';
import type { ParsedBaseStyleProps } from '../../types';

export const GeometryUpdaterFactory = 'GeometryUpdaterFactory';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type GeometryUpdaterFactory = (name: string) => GeometryAABBUpdater;

export const GeometryAABBUpdater = 'GeometryAABBUpdater';
// eslint-disable-next-line @typescript-eslint/no-redeclare
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
