import { getFormatCompByteSize } from '../format';
import {
  BufferUsage,
  IndexBufferDescriptor,
  InputState,
  ResourceType,
  VertexBufferDescriptor,
  VertexBufferFrequency,
} from '../interfaces';
import { assert, assertExists } from '../utils';
import { Buffer_GL } from './Buffer';
import { Device_GL } from './Device';
import { InputLayout_GL } from './InputLayout';
import { ResourceBase_GL } from './ResourceBase';
import {
  getPlatformBuffer,
  isFormatSizedInteger,
  isWebGL2,
  translateIndexFormat,
  translateVertexFormat,
} from './utils';

export class InputState_GL extends ResourceBase_GL implements InputState {
  type: ResourceType.InputState = ResourceType.InputState;

  vao: WebGLVertexArrayObject;
  indexBufferByteOffset: number | null;
  indexBufferType: GLenum | null;
  indexBufferCompByteSize: number | null;
  inputLayout: InputLayout_GL;
  vertexBuffers: (VertexBufferDescriptor | null)[];

  constructor({
    id,
    device,
    inputLayout,
    vertexBuffers,
    indexBufferBinding,
  }: {
    id: number;
    device: Device_GL;
    inputLayout: InputLayout_GL;
    vertexBuffers: (VertexBufferDescriptor | null)[];
    indexBufferBinding: IndexBufferDescriptor | null;
  }) {
    super({ id, device });

    const gl = this.device.gl;
    const vao = this.device.ensureResourceExists(
      isWebGL2(gl) ? gl.createVertexArray() : device.OES_vertex_array_object.createVertexArrayOES(),
    );

    if (isWebGL2(gl)) {
      gl.bindVertexArray(vao);
    } else {
      device.OES_vertex_array_object.bindVertexArrayOES(vao);
    }

    for (let i = 0; i < inputLayout.vertexAttributeDescriptors.length; i++) {
      const attr = inputLayout.vertexAttributeDescriptors[i];

      const { format, location, divisor = 1, byteStride, bufferByteOffset, bufferIndex } = attr;

      if (isFormatSizedInteger(format)) {
        // See https://groups.google.com/d/msg/angleproject/yQb5DaCzcWg/Ova0E3wcAQAJ for more info.
        // console.warn("Vertex format uses sized integer types; this will cause a shader recompile on ANGLE platforms");
        // debugger;
      }

      const { size, type, normalized } = translateVertexFormat(format);
      const vertexBuffer = vertexBuffers[bufferIndex];
      if (vertexBuffer === null) continue;

      const inputLayoutBuffer = assertExists(inputLayout.vertexBufferDescriptors[bufferIndex]);

      const buffer = vertexBuffer.buffer as Buffer_GL;
      assert(buffer.usage === BufferUsage.Vertex);
      gl.bindBuffer(gl.ARRAY_BUFFER, getPlatformBuffer(vertexBuffer.buffer));

      const bufferOffset = vertexBuffer.byteOffset + bufferByteOffset;
      gl.vertexAttribPointer(
        location,
        size,
        type,
        normalized,
        byteStride || inputLayoutBuffer.byteStride,
        bufferOffset,
      );

      if (inputLayoutBuffer.frequency === VertexBufferFrequency.PerInstance) {
        if (isWebGL2(gl)) {
          // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribDivisor
          gl.vertexAttribDivisor(location, divisor);
        } else {
          device.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(location, divisor);
        }
      }

      gl.enableVertexAttribArray(location);
    }

    let indexBufferType: GLenum | null = null;
    let indexBufferCompByteSize: number | null = null;
    let indexBufferByteOffset: number | null = null;
    if (indexBufferBinding !== null) {
      const buffer = indexBufferBinding.buffer as Buffer_GL;
      assert(buffer.usage === BufferUsage.Index);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, getPlatformBuffer(indexBufferBinding.buffer));
      indexBufferType = translateIndexFormat(assertExists(inputLayout.indexBufferFormat));
      indexBufferCompByteSize = getFormatCompByteSize(inputLayout.indexBufferFormat!);
      indexBufferByteOffset = indexBufferBinding.byteOffset;
    }

    if (isWebGL2(gl)) {
      gl.bindVertexArray(null);
    } else {
      device.OES_vertex_array_object.bindVertexArrayOES(null);
    }

    this.vao = vao;
    this.indexBufferByteOffset = indexBufferByteOffset;
    this.indexBufferType = indexBufferType;
    this.indexBufferCompByteSize = indexBufferCompByteSize;
    this.inputLayout = inputLayout;
    this.vertexBuffers = vertexBuffers;
  }

  destroy() {
    super.destroy();
    if (this.device.currentBoundVAO === this.vao) {
      if (isWebGL2(this.device.gl)) {
        this.device.gl.bindVertexArray(null);
        this.device.gl.deleteVertexArray(this.vao);
      } else {
        this.device.OES_vertex_array_object.bindVertexArrayOES(null);
        this.device.OES_vertex_array_object.deleteVertexArrayOES(this.vao);
      }
      this.device.currentBoundVAO = null;
    }
  }
}
