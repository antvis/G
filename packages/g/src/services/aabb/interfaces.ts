import { Syringe } from 'mana-syringe';
import type { DisplayObject } from '../../display-objects/DisplayObject';
import type { ParsedBaseStyleProps } from '../../types';

export const GeometryUpdaterFactory = Syringe.defineToken('GeometryUpdaterFactory');
export const GeometryAABBUpdater = Syringe.defineToken('GeometryAABBUpdater');
// eslint-disable-next-line @typescript-eslint/no-redeclare
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
    z?: number;
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
  };
}
