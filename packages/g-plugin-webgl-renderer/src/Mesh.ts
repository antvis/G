import { CustomElement, DisplayObject, DisplayObjectConfig } from '@antv/g';
import type { ParsedBaseStyleProps, BaseStyleProps } from '@antv/g';
import { Geometry } from './geometries';
import { Material } from './materials';

export interface MeshStyleProps extends BaseStyleProps {
  geometry: Geometry;
  material: Material;
}

export interface ParsedMeshStyleProps extends ParsedBaseStyleProps {
  geometry: Geometry;
  material: Material;
}

export class Mesh extends DisplayObject<MeshStyleProps> {
  static tag = 'mesh';

  constructor({ style, ...rest }: DisplayObjectConfig<MeshStyleProps>) {
    super({
      type: Mesh.tag,
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
