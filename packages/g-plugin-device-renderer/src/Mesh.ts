import type {
  BaseStyleProps,
  DisplayObjectConfig,
  ParsedBaseStyleProps,
} from '@antv/g-lite';
import { DisplayObject, Shape } from '@antv/g-lite';
import type { BufferGeometry } from './geometries';
import type { Material } from './materials';

export interface MeshStyleProps extends BaseStyleProps {
  x?: number | string;
  y?: number | string;
  z?: number | string;
  geometry: BufferGeometry;
  material: Material;
}

export interface ParsedMeshStyleProps extends ParsedBaseStyleProps {
  x: number;
  y: number;
  z: number;
  geometry: BufferGeometry;
  material: Material;
}

export class Mesh<GeometryProps = any> extends DisplayObject<
  GeometryProps & MeshStyleProps
> {
  static PARSED_STYLE_LIST = new Set([
    ...DisplayObject.PARSED_STYLE_LIST,
    'x',
    'y',
    'z',
    'geometry',
    'material',
  ]);

  constructor({
    style,
    ...rest
  }: DisplayObjectConfig<GeometryProps & MeshStyleProps>) {
    super({
      type: Shape.MESH,
      style: {
        x: '',
        y: '',
        z: '',
        lineWidth: 0,
        ...style,
      },
      ...rest,
    });

    this.cullable.enable = false;

    this.style.geometry.meshes.push(this);
    this.style.material.meshes.push(this);
  }

  // getVertexBufferData(bufferIndex: number) {
  //   return this.style.geometry.vertexBuffers[bufferIndex];
  // }

  // setVertexBufferData(descriptor: {
  //   bufferIndex: number;
  //   byteOffset: number;
  //   data: ArrayBufferView;
  // }) {}

  destroy() {
    super.destroy();

    // detach from geometry
    let { meshes } = this.style.geometry;
    let index = meshes.indexOf(this);
    meshes.splice(index, 1);

    // detach from material
    meshes = this.style.material.meshes;
    index = meshes.indexOf(this);
    meshes.splice(index, 1);
  }
}
