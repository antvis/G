import { inject, injectable } from 'inversify';
import { fillVec4 } from '../render/utils';
import { Format, VertexBufferFrequency } from '../platform';
import { RenderInst } from '../render/RenderInst';
import { Circle, CircleStyleProps, DisplayObject, SHAPE } from '@antv/g';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch } from './Batch';
import { Program_GL } from '../platform/webgl2/Program';

const PointShapes = ['circle', 'ellipse', 'rect', 'rounded-rect'];

class CircleProgram extends DeviceProgram {
  static a_Extrude = Object.keys(Batch.AttributeLocation).length;
  static a_StylePacked2 = Object.keys(Batch.AttributeLocation).length + 1;
  static a_Size = Object.keys(Batch.AttributeLocation).length + 2;

  static ub_ObjectParams = 1;

  both: string = `
${Batch.ShaderLibrary.BothDeclaration}
layout(std140) uniform ub_ObjectParams {
  float u_Blur;
};
  `;

  vert: string = `
${Batch.ShaderLibrary.VertDeclaration}
layout(location = ${CircleProgram.a_Extrude}) attribute vec2 a_Extrude;
layout(location = ${CircleProgram.a_StylePacked2}) attribute vec4 a_StylePacked2;
layout(location = ${CircleProgram.a_Size}) attribute vec2 a_Size;

varying vec4 v_Data;
varying vec2 v_Radius;
varying vec4 v_StylePacked2;

void main() {
  ${Batch.ShaderLibrary.Vert}

  float antialiasblur = 1.0 / (a_Size.x + u_StrokeWidth);

  vec2 u_Anchor = a_StylePacked2.yz;
  vec2 offset = (a_Extrude + vec2(1.0) - 2.0 * a_Anchor) * a_Size;

  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(offset, -u_ZIndex, 1.0);
  
  v_Radius = a_Size;
  v_Data = vec4(a_Extrude, antialiasblur, a_StylePacked2.x);
  v_StylePacked2 = a_StylePacked2;
}
  `;

  frag: string = `
varying vec4 v_Data;
varying vec2 v_Radius;
varying vec4 v_StylePacked2;

${Batch.ShaderLibrary.FragDeclaration}

/**
 * 2D signed distance field functions
 * @see http://www.iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
 */

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

// @see http://www.iquilezles.org/www/articles/ellipsoids/ellipsoids.htm
float sdEllipsoidApproximated(vec2 p, vec2 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

// @see https://www.shadertoy.com/view/4llXD7
float sdRoundedBox(vec2 p, vec2 b, vec2 r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

void main() {
  int shape = int(floor(v_Data.w + 0.5));

  ${Batch.ShaderLibrary.Frag}

  float antialiasblur = v_Data.z;
  float antialiased_blur = -max(u_Blur, antialiasblur);
  vec2 r = v_Radius / (v_Radius + u_StrokeWidth);

  float outer_df;
  float inner_df;
  // 'circle', 'ellipse', 'rect'
  if (shape == 0) {
    outer_df = sdCircle(v_Data.xy, 1.0);
    inner_df = sdCircle(v_Data.xy, r.x);
  } else if (shape == 1) {
    outer_df = sdEllipsoidApproximated(v_Data.xy, vec2(1.0));
    inner_df = sdEllipsoidApproximated(v_Data.xy, r);
  } else if (shape == 2) {
    float u_RectRadius = v_StylePacked2.w;
    outer_df = sdRoundedBox(v_Data.xy, vec2(1.0), u_RectRadius / v_Radius);
    inner_df = sdRoundedBox(v_Data.xy, r, u_RectRadius / v_Radius);
  }

  float opacity_t = smoothstep(0.0, antialiased_blur, outer_df);

  float color_t = u_StrokeWidth < 0.01 ? 0.0 : smoothstep(
    antialiased_blur,
    0.0,
    inner_df
  );

  vec4 diffuseColor = u_Color;

  vec4 strokeColor = u_StrokeColor == vec4(0) ? diffuseColor : u_StrokeColor;

  gl_FragColor = mix(vec4(diffuseColor.rgb, diffuseColor.a * u_FillOpacity), strokeColor * u_StrokeOpacity, color_t);
  gl_FragColor.a = gl_FragColor.a * u_Opacity * opacity_t;

  if (gl_FragColor.a < 0.01)
    discard;
}
  `;
}

@injectable()
export class CircleRenderer extends Batch {
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
      instanced2.push(
        PointShapes.indexOf(circle.nodeName),
        ...(circle.nodeName === SHAPE.Rect ? [1, 1] : [0, 0]),
        radius || 0,
      );

      interleaved.push(-1, -1, 1, -1, 1, 1, -1, 1);
      indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
    });

    this.geometry.setIndices(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: CircleProgram.a_Extrude,
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
          location: CircleProgram.a_StylePacked2,
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
    }
  }

  protected uploadUBO(renderInst: RenderInst): void {
    // Upload to our UBO.
    let offs = renderInst.allocateUniformBuffer(CircleProgram.ub_ObjectParams, 4);
    const d = renderInst.mapUniformBufferF32(CircleProgram.ub_ObjectParams);
    offs += fillVec4(d, offs, 0); // u_Blur

    // offs += fillMatrix4x4(d, offs, this.camera.getPerspective()); // ProjectionMatrix 16
    //   offs += fillMatrix4x4(d, offs, this.camera.getViewTransform()); // ViewMatrix 16
    //   offs += fillVec3v(d, offs, this.camera.getPosition(), this.contextService.getDPR()); // CameraPosition DPR 4
    const program = renderInst.renderPipelineDescriptor.program as Program_GL;
    program.setUniforms({
      u_ProjectionMatrix: this.camera.getPerspective(),
      u_ViewMatrix: this.camera.getViewTransform(),
      u_CameraPosition: this.camera.getPosition(),
      u_DevicePixelRatio: 2,
      u_Blur: 0,
    });
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
