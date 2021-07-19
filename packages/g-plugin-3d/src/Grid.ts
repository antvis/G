import { BaseStyleProps, DisplayObject, DisplayObjectConfig } from '@antv/g';
import { SHAPE_3D } from './types';

export interface GridStyleProps extends BaseStyleProps {
  height: number;
  width: number;
}
export class Grid extends DisplayObject<GridStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<GridStyleProps>) {
    super({
      // @ts-ignore
      type: SHAPE_3D.Grid,
      style: {
        height: 0,
        width: 0,
        ...style,
      },
      ...rest,
    });
  }
}
