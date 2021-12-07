import { DisplayObject, DisplayObjectConfig } from '@antv/g';
import type { ParsedBaseStyleProps, BaseStyleProps } from '@antv/g';
import { Geometry } from './Geometry';
import { Material } from './material/Material';

export interface MeshStyleProps extends BaseStyleProps {
  geometry: Geometry;
  material: Material;
}

export interface ParsedMeshStyleProps extends ParsedBaseStyleProps {
  geometry: Geometry;
  material: Material;
}

export class Mesh extends DisplayObject<MeshStyleProps, ParsedMeshStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<MeshStyleProps>) {
    super({
      type: 'mesh',
      style: {
        ...style,
      },
      ...rest,
    });
  }

  destroy() {
    super.destroy();

    this.style.geometry.destroy();
  }
}
