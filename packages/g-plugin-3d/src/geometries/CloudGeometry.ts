import {
  Device,
  VertexAttributeLocation,
  VertexBufferFrequency,
  Format,
  PrimitiveTopology,
} from '@antv/g-plugin-webgl-renderer';
import { ProceduralGeometry, ProceduralGeometryAttributeLocation } from './ProceduralGeometry';
import { vec3 } from 'gl-matrix';

export interface CloudGeometryProps {
  vertexs: vec3[];
}

export class CloudGeometry extends ProceduralGeometry<CloudGeometryProps> {
  drawMode: PrimitiveTopology = PrimitiveTopology.Points;
  vertexs: vec3[];

  constructor(device: Device, props: Partial<CloudGeometryProps> = {}) {
    super(device, {
      ...props,
    });
    this.vertexs = props.vertexs;
  }

  build() {
    const { vertexCount, positions } = this.createTopology();
    this.vertexCount = vertexCount;

    this.setVertexBuffer({
      bufferIndex: ProceduralGeometryAttributeLocation.POSITION,
      byteStride: 4 * 3,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.MAX,
        },
      ],
      data: Float32Array.from(positions),
    });

    this.applyMat4(this.flipYMatrix);
    this.dirty = true;
  }

  createTopology() {
    return {
      vertexCount: this.vertexs.length,
      positions: this.vertexs.flat(1) as number[],
    };
  }
}
