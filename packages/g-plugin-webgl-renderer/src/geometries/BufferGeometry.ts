import { ElementEvent } from '@antv/g';
import { EventEmitter } from 'eventemitter3';
import { Mesh } from '../Mesh';
import { Format, InputLayoutDescriptor, PrimitiveTopology } from '../platform';
import { GeometryVertexBufferDescriptor, IndicesArray } from './Geometry';

export interface GeometryPatch {
  bufferIndex: number;
  location: number;
  data: ArrayBufferView;
}

export interface VertexBufferToUpdateDescriptor {
  bufferIndex: number;
  bufferByteOffset?: number;
  data: ArrayBufferView;
}

export enum VertexAttributeLocation {
  // TODO: bind mat4 in WebGL2 instead of decomposed 4 * vec4?
  // @see https://stackoverflow.com/questions/38853096/webgl-how-to-bind-values-to-a-mat4-attribute/38853623#38853623
  MODEL_MATRIX0,
  MODEL_MATRIX1,
  MODEL_MATRIX2,
  MODEL_MATRIX3,
  COLOR,
  STROKE_COLOR,
  PACKED_STYLE1, // opacity fillOpacity strokeOpacity lineWidth
  PACKED_STYLE2, // visibility
  PICKING_COLOR,
  ANCHOR,
  MAX,
}

/**
 * just hold descriptors of buffers & indices, won't use underlying GPU resources
 */
export class BufferGeometry<GeometryProps = any> extends EventEmitter {
  /**
   * 绘制模式
   */
  drawMode: PrimitiveTopology = PrimitiveTopology.Triangles;

  /**
   * 索引数组
   */
  indices: IndicesArray;

  inputLayoutDescriptor: InputLayoutDescriptor = {
    vertexBufferDescriptors: [],
    vertexAttributeDescriptors: [],
    indexBufferFormat: Format.U32_R,
  };

  vertexBuffers: ArrayBufferView[] = [];

  vertexBuffersToUpdate: VertexBufferToUpdateDescriptor[] = [];

  vertexCount: number = 0;

  instancedCount: number = 0;

  indexStart: number = 0;

  primitiveStart: number = 0;

  dirty = true;

  meshes: Mesh[] = [];

  build(meshes: Mesh<GeometryProps>[]) {}

  update<Key extends keyof GeometryProps>(
    index: number,
    mesh: Mesh,
    name: Key,
    value: GeometryProps[Key],
  ): GeometryPatch[] {
    return [];
  }

  setIndices(indices: IndicesArray) {
    this.indices = indices;
  }

  setVertexBuffer(descriptor: GeometryVertexBufferDescriptor) {
    const { bufferIndex, byteStride, frequency, attributes, data } = descriptor;

    this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex] = {
      byteStride,
      frequency,
    };

    attributes.forEach(({ format, bufferByteOffset, location, divisor, byteStride }) => {
      const existed = this.inputLayoutDescriptor.vertexAttributeDescriptors.find(
        (e) => e.bufferIndex === bufferIndex && e.location === location,
      );
      if (existed) {
        existed.format = format;
        existed.bufferByteOffset = bufferByteOffset;
        existed.byteStride = byteStride;
        existed.divisor = divisor;
      } else {
        this.inputLayoutDescriptor.vertexAttributeDescriptors.push({
          format,
          bufferIndex,
          bufferByteOffset,
          location,
          byteStride,
          divisor,
        });
      }
    });

    this.vertexBuffers[bufferIndex] = data;
  }

  updateVertexBufferData(descriptor: VertexBufferToUpdateDescriptor) {
    this.vertexBuffersToUpdate.push({
      bufferByteOffset: 0,
      ...descriptor,
    });

    // trigger re-render
    this.meshes.forEach((mesh) => {
      mesh.emit(ElementEvent.ATTRIBUTE_CHANGED, {
        attributeName: 'geometry',
      });
    });
  }
}
