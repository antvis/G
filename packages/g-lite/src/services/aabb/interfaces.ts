import type { DisplayObject } from '../../display-objects/DisplayObject';

export interface GeometryAABBUpdater<T extends DisplayObject = DisplayObject> {
  update: (object: T) => {
    cx: number;
    cy: number;
    cz?: number;
    hwidth: number;
    hheight: number;
    hdepth?: number;
  };
}
