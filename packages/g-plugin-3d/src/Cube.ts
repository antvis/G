import { DisplayObject, DisplayObjectConfig } from '@antv/g';
import type { ParsedBaseStyleProps, BaseStyleProps } from '@antv/g';
import { SHAPE_3D } from './types';

export interface CubeStyleProps extends BaseStyleProps {
  height: number;
  width: number;
  depth: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
  map?: string;
}
export interface ParsedCubeStyleProps extends ParsedBaseStyleProps {
  height: number;
  width: number;
  depth: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
  map?: string;
}
export class Cube extends DisplayObject<CubeStyleProps, ParsedCubeStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<CubeStyleProps>) {
    super({
      // @ts-ignore
      type: SHAPE_3D.Cube,
      style: {
        height: 0,
        width: 0,
        depth: 0,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1,
        ...style,
      },
      ...rest,
    });
  }
}
