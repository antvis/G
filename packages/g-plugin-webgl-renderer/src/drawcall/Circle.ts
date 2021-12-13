import { Circle, CircleStyleProps, DisplayObject, ContextService, SHAPE } from '@antv/g';
import { inject, injectable } from 'mana-syringe';
import { fillVec4 } from '../render/utils';
import { Format, VertexBufferFrequency } from '../platform';
import { RenderInst } from '../render/RenderInst';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch, AttributeLocation } from './Batch';
import { Program_GL } from '../platform/webgl2/Program';
import { ShapeRenderer } from '../tokens';
import vert from '../shader/circle.vert';
import frag from '../shader/circle.frag';

const PointShapes: string[] = [SHAPE.Circle, SHAPE.Ellipse, SHAPE.Rect];

class CircleProgram extends DeviceProgram {
  static a_Extrude = AttributeLocation.MAX;
  static a_StylePacked3 = AttributeLocation.MAX + 1;
  static a_Size = AttributeLocation.MAX + 2;
  static a_Uv = AttributeLocation.MAX + 3;

  static ub_ObjectParams = 1;

  vert: string = vert;

  frag: string = frag;
}
@injectable({
  token: [
    { token: ShapeRenderer, named: SHAPE.Circle },
    { token: ShapeRenderer, named: SHAPE.Ellipse },
    { token: ShapeRenderer, named: SHAPE.Rect },
  ],
})
export class CircleRenderer extends Batch {
  @inject(ContextService)
  private contextService: ContextService<WebGLRenderingContext>;

  protected program = new CircleProgram();

  protected validate() {
    return true;
  }

  protected buildGeometry() {
    const interleaved = [];
    const instanced = [];
    const instanced2 = [];
    const indices = [];
    this.objects.forEach((object, i) => {
      const circle = object as Circle;
      const offset = i * 4;
      // @ts-ignore
      const { lineWidth = 0, radius } = circle.parsedStyle;
      const [halfWidth, halfHeight] = this.getSize(object.attributes, circle.nodeName);
      const size = [halfWidth + lineWidth / 2, halfHeight + lineWidth / 2];
      instanced.push(...size);
      instanced2.push(PointShapes.indexOf(circle.nodeName), radius || 0, 0, 0);

      interleaved.push(-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1);
      indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
    });

    this.geometry.setIndices(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: CircleProgram.a_Extrude,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 2,
          location: CircleProgram.a_Uv,
        },
      ],
      data: new Float32Array(interleaved),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: 2,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: CircleProgram.a_Size,
          divisor: 1,
        },
      ],
      data: new Float32Array(instanced),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: 3,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: CircleProgram.a_StylePacked3,
          divisor: 1,
        },
      ],
      data: new Float32Array(instanced2),
    });
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    super.updateAttribute(object, name, value);

    const index = this.objects.indexOf(object);
    const geometry = this.geometry;

    if (
      name === 'r' ||
      name === 'rx' ||
      name === 'ry' ||
      name === 'width' ||
      name === 'height' ||
      name === 'lineWidth'
    ) {
      const circle = object as Circle;
      const { lineWidth } = circle.parsedStyle;
      const [halfWidth, halfHeight] = this.getSize(object.attributes, object.nodeName);
      const size = [halfWidth + lineWidth / 2, halfHeight + lineWidth / 2];

      geometry.updateVertexBuffer(
        2,
        CircleProgram.a_Size,
        index,
        new Uint8Array(new Float32Array([...size]).buffer),
      );
    } else if (name === 'radius') {
      geometry.updateVertexBuffer(
        3,
        CircleProgram.a_StylePacked3,
        index,
        new Uint8Array(
          new Float32Array([
            PointShapes.indexOf(object.nodeName),
            object.parsedStyle.radius || 0,
            0,
            0,
          ]).buffer,
        ),
      );
    }
  }

  protected uploadUBO(renderInst: RenderInst): void {
    renderInst.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 1 }]);
    renderInst.setSamplerBindingsFromTextureMappings([this.fillMapping]);

    // offs += fillMatrix4x4(d, offs, this.camera.getPerspective()); // ProjectionMatrix 16
    //   offs += fillMatrix4x4(d, offs, this.camera.getViewTransform()); // ViewMatrix 16
    //   offs += fillVec3v(d, offs, this.camera.getPosition(), this.contextService.getDPR()); // CameraPosition DPR 4
    const program = renderInst.renderPipelineDescriptor.program as Program_GL;

    // FIXME: use uniform by names in WebGL
    if (program.gl_program) {
      program.setUniforms({
        u_ProjectionMatrix: this.camera.getPerspective(),
        u_ViewMatrix: this.camera.getViewTransform(),
        u_CameraPosition: this.camera.getPosition(),
        u_DevicePixelRatio: this.contextService.getDPR(),
      });
    }
  }

  private getSize(attributes: CircleStyleProps, tagName: string) {
    if (tagName === SHAPE.Circle) {
      return [attributes.r, attributes.r];
    } else if (tagName === SHAPE.Ellipse) {
      // @ts-ignore
      return [attributes.rx, attributes.ry];
    } else if (tagName === SHAPE.Rect) {
      // @ts-ignore
      return [(attributes.width || 0) / 2, (attributes.height || 0) / 2];
    }
    return [0, 0];
  }
}
