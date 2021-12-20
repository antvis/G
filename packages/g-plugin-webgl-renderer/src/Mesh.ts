import { CustomElement, DisplayObject, DisplayObjectConfig, ElementEvent } from '@antv/g';
import type { ParsedBaseStyleProps, BaseStyleProps } from '@antv/g';
import { BufferGeometry } from './geometries';
import { Material } from './materials';

export interface MeshStyleProps extends BaseStyleProps {
  geometry: BufferGeometry;
  material: Material;
}

export interface ParsedMeshStyleProps extends ParsedBaseStyleProps {
  geometry: BufferGeometry;
  material: Material;
}

export class Mesh<GeometryProps = any> extends DisplayObject<GeometryProps & MeshStyleProps> {
  static tag = 'mesh';

  constructor({ style, ...rest }: DisplayObjectConfig<GeometryProps & MeshStyleProps>) {
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

    // this.style.geometry.destroy();
  }
}
