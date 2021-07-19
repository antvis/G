import { DisplayObject, DisplayObjectConfig, BaseStyleProps } from '@antv/g';
import { SHAPE_3D } from './types';

export interface SphereStyleProps extends BaseStyleProps {
  height?: number;
  width?: number;
  depth?: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
  map?: string;
}
export class Sphere extends DisplayObject<SphereStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<SphereStyleProps>) {
    super({
      // @ts-ignore
      type: SHAPE_3D.Sphere,
      style: {
        ...style,
      },
      ...rest,
    });
  }
}
