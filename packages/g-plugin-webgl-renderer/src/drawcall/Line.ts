/**
 * @see https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
 */
import { inject, injectable } from 'mana-syringe';
import { Line, LINE_CAP, LINE_JOIN, Path, PolygonShape, Polyline } from '@antv/g';
import earcut from 'earcut';
import { fillMatrix4x4, fillVec4, makeSortKeyOpaque, RendererLayer } from '../render/utils';
import {
  Buffer,
  BufferUsage,
  CullMode,
  Device,
  Format,
  InputLayout,
  InputState,
  Program,
  VertexBufferFrequency,
} from '../platform';
import { RenderCache } from '../render/RenderCache';
import { RenderInst } from '../render/RenderInst';
import { DisplayObject, PARSED_COLOR_TYPE, Point, SHAPE, Tuple4Number } from '@antv/g';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
import { Renderable3D } from '../components/Renderable3D';

export enum JOINT_TYPE {
  NONE = 0,
  FILL = 1,
  JOINT_BEVEL = 4,
  JOINT_MITER = 8,
  JOINT_ROUND = 12,
  JOINT_CAP_BUTT = 16,
  JOINT_CAP_SQUARE = 18,
  JOINT_CAP_ROUND = 20,
  FILL_EXPAND = 24,
  CAP_BUTT = 1 << 5,
  CAP_SQUARE = 2 << 5,
  CAP_ROUND = 3 << 5,
  CAP_BUTT2 = 4 << 5,
}

const stridePoints = 2;
const strideFloats = 3;
const strideBytes = 3 * 4;

class LineProgram extends DeviceProgram {
  static a_Prev = 0;
  static a_Point1 = 0 + 1;
  static a_Point2 = 0 + 2;
  static a_Next = 0 + 3;
  static a_VertexJoint = 0 + 4;
  static a_VertexNum = 0 + 5;
  static a_Travel = 6;

  static ub_ObjectParams = 1;

  both: string = `
  ${Batch.ShaderLibrary.BothDeclaration}
  layout(std140) uniform ub_ObjectParams {
    mat4 u_ModelMatrix;
    vec4 u_Color;
    vec4 u_StrokeColor;
    float u_StrokeWidth;
    float u_Opacity;
    float u_FillOpacity;
    float u_StrokeOpacity;
    float u_Expand;
    float u_MiterLimit;
    float u_ScaleMode;
    float u_Alignment;
    vec4 u_PickingColor;
    float u_Dash;
    float u_Gap;
    vec2 u_Anchor;
  };
  `;

  vert: string = `
  layout(location = ${LineProgram.a_Prev}) attribute vec2 a_Prev;
  layout(location = ${LineProgram.a_Point1}) attribute vec2 a_Point1;
  layout(location = ${LineProgram.a_Point2}) attribute vec2 a_Point2;
  layout(location = ${LineProgram.a_Next}) attribute vec2 a_Next;
  layout(location = ${LineProgram.a_VertexJoint}) attribute float a_VertexJoint;
  layout(location = ${LineProgram.a_VertexNum}) attribute float a_VertexNum;
  // layout(location = ${LineProgram.a_Travel}) attribute float a_Travel;

  const float FILL = 1.0;
  const float BEVEL = 4.0;
  const float MITER = 8.0;
  const float ROUND = 12.0;
  const float JOINT_CAP_BUTT = 16.0;
  const float JOINT_CAP_SQUARE = 18.0;
  const float JOINT_CAP_ROUND = 20.0;
  const float FILL_EXPAND = 24.0;
  const float CAP_BUTT = 1.0;
  const float CAP_SQUARE = 2.0;
  const float CAP_ROUND = 3.0;
  const float CAP_BUTT2 = 4.0;

  out vec4 v_Distance;
  out vec4 v_Arc;
  out float v_Type;
  // out float v_Travel;

  out vec4 v_PickingResult;
  #define COLOR_SCALE 1. / 255.
  void setPickingColor(vec3 pickingColor) {
    v_PickingResult.rgb = pickingColor * COLOR_SCALE;
  }

  vec2 doBisect(
    vec2 norm, float len, vec2 norm2, float len2, float dy, float inner
  ) {
    vec2 bisect = (norm + norm2) / 2.0;
    bisect /= dot(norm, bisect);
    vec2 shift = dy * bisect;
    if (inner > 0.5) {
      if (len < len2) {
        if (abs(dy * (bisect.x * norm.y - bisect.y * norm.x)) > len) {
          return dy * norm;
        }
      } else {
        if (abs(dy * (bisect.x * norm2.y - bisect.y * norm2.x)) > len2) {
          return dy * norm;
        }
      }
    }
    return dy * bisect;
  }
  
  void main() {
    vec2 pointA = (u_ModelMatrix * vec4(a_Point1, 0., 1.0)).xy;
    vec2 pointB = (u_ModelMatrix * vec4(a_Point2, 0., 1.0)).xy;

    vec2 xBasis = pointB - pointA;
    float len = length(xBasis);
    vec2 forward = xBasis / len;
    vec2 norm = vec2(forward.y, -forward.x);

    float type = a_VertexJoint;
    float lineWidth = u_StrokeWidth;

    if (u_ScaleMode > 2.5) {
      lineWidth *= length(u_ModelMatrix * vec4(1.0, 0.0, 0.0, 0.0));
    } else if (u_ScaleMode > 1.5) {
      lineWidth *= length(u_ModelMatrix * vec4(0.0, 1.0, 0.0, 0.0));
    } else if (u_ScaleMode > 0.5) {
      vec2 avgDiag = (u_ModelMatrix * vec4(1.0, 1.0, 0.0, 0.0)).xy;
      lineWidth *= sqrt(dot(avgDiag, avgDiag) * 0.5);
    }
    float capType = floor(type / 32.0);
    type -= capType * 32.0;
    v_Arc = vec4(0.0);
    lineWidth *= 0.5;
    float lineAlignment = 2.0 * u_Alignment - 1.0;

    vec2 pos;

    if (capType == CAP_ROUND) {
      if (a_VertexNum < 3.5) {
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }
      type = JOINT_CAP_ROUND;
      capType = 0.0;
    }

    if (type >= BEVEL) {
      float dy = lineWidth + u_Expand;
      float inner = 0.0;
      if (a_VertexNum >= 1.5) {
        dy = -dy;
        inner = 1.0;
      }

      vec2 base, next, xBasis2, bisect;
      float flag = 0.0;
      float sign2 = 1.0;
      if (a_VertexNum < 0.5 || a_VertexNum > 2.5 && a_VertexNum < 3.5) {
        next = (u_ModelMatrix * vec4(a_Prev, 0.0, 1.0)).xy;
        base = pointA;
        flag = type - floor(type / 2.0) * 2.0;
        sign2 = -1.0;

      } else {
        next = (u_ModelMatrix * vec4(a_Next, 0.0, 1.0)).xy;
        base = pointB;
        if (type >= MITER && type < MITER + 3.5) {
          flag = step(MITER + 1.5, type);
          // check miter limit here?
        }
      }
      xBasis2 = next - base;
      float len2 = length(xBasis2);
      vec2 norm2 = vec2(xBasis2.y, -xBasis2.x) / len2;
      float D = norm.x * norm2.y - norm.y * norm2.x;
      if (D < 0.0) {
        inner = 1.0 - inner;
      }
      norm2 *= sign2;

      if (abs(lineAlignment) > 0.01) {
        float shift = lineWidth * lineAlignment;
        pointA += norm * shift;
        pointB += norm * shift;
        if (abs(D) < 0.01) {
          base += norm * shift;
        } else {
          base += doBisect(norm, len, norm2, len2, shift, 0.0);
        }
      }

      float collinear = step(0.0, dot(norm, norm2));
      v_Type = 0.0;
      float dy2 = -1000.0;
      float dy3 = -1000.0;
      if (abs(D) < 0.01 && collinear < 0.5) {
        if (type >= ROUND && type < ROUND + 1.5) {
          type = JOINT_CAP_ROUND;
        }
        //TODO: BUTT here too
      }

      if (a_VertexNum < 3.5) {
        if (abs(D) < 0.01) {
          pos = dy * norm;
        } else {
          if (flag < 0.5 && inner < 0.5) {
            pos = dy * norm;
          } else {
            pos = doBisect(norm, len, norm2, len2, dy, inner);
          }
        }
        if (capType >= CAP_BUTT && capType < CAP_ROUND) {
          float extra = step(CAP_SQUARE, capType) * lineWidth;
          vec2 back = -forward;
          if (a_VertexNum < 0.5 || a_VertexNum > 2.5) {
            pos += back * (u_Expand + extra);
            dy2 = u_Expand;
          } else {
            dy2 = dot(pos + base - pointA, back) - extra;
          }
        }
        if (type >= JOINT_CAP_BUTT && type < JOINT_CAP_SQUARE + 0.5) {
          float extra = step(JOINT_CAP_SQUARE, type) * lineWidth;
          if (a_VertexNum < 0.5 || a_VertexNum > 2.5) {
            dy3 = dot(pos + base - pointB, forward) - extra;
          } else {
            pos += forward * (u_Expand + extra);
            dy3 = u_Expand;
            if (capType >= CAP_BUTT) {
              dy2 -= u_Expand + extra;
            }
          }
        }
      } else if (type >= JOINT_CAP_ROUND && type < JOINT_CAP_ROUND + 1.5) {
        if (inner > 0.5) {
          dy = -dy;
          inner = 0.0;
        }
        vec2 d2 = abs(dy) * forward;
        if (a_VertexNum < 4.5) {
          dy = -dy;
          pos = dy * norm;
        } else if (a_VertexNum < 5.5) {
          pos = dy * norm;
        } else if (a_VertexNum < 6.5) {
          pos = dy * norm + d2;
          v_Arc.x = abs(dy);
        } else {
          dy = -dy;
          pos = dy * norm + d2;
          v_Arc.x = abs(dy);
        }
        dy2 = 0.0;
        v_Arc.y = dy;
        v_Arc.z = 0.0;
        v_Arc.w = lineWidth;
        v_Type = 3.0;
      } else if (abs(D) < 0.01) {
        pos = dy * norm;
      } else {
        if (type >= ROUND && type < ROUND + 1.5) {
          if (inner > 0.5) {
            dy = -dy;
            inner = 0.0;
          }
          if (a_VertexNum < 4.5) {
            pos = doBisect(norm, len, norm2, len2, -dy, 1.0);
          } else if (a_VertexNum < 5.5) {
            pos = dy * norm;
          } else if (a_VertexNum > 7.5) {
            pos = dy * norm2;
          } else {
            pos = doBisect(norm, len, norm2, len2, dy, 0.0);
            float d2 = abs(dy);
            if (length(pos) > abs(dy) * 1.5) {
              if (a_VertexNum < 6.5) {
                pos.x = dy * norm.x - d2 * norm.y;
                pos.y = dy * norm.y + d2 * norm.x;
              } else {
                pos.x = dy * norm2.x + d2 * norm2.y;
                pos.y = dy * norm2.y - d2 * norm2.x;
              }
            }
          }
          vec2 norm3 = normalize(norm + norm2);
          float sign = step(0.0, dy) * 2.0 - 1.0;
          v_Arc.x = sign * dot(pos, norm3);
          v_Arc.y = pos.x * norm3.y - pos.y * norm3.x;
          v_Arc.z = dot(norm, norm3) * lineWidth;
          v_Arc.w = lineWidth;
          dy = -sign * dot(pos, norm);
          dy2 = -sign * dot(pos, norm2);
          dy3 = v_Arc.z - v_Arc.x;
          v_Type = 3.0;
        } else {
          float hit = 0.0;
          if (type >= BEVEL && type < BEVEL + 1.5) {
            if (dot(norm, norm2) > 0.0) {
              type = MITER;
            }
          }
          if (type >= MITER && type < MITER + 3.5) {
            if (inner > 0.5) {
              dy = -dy;
              inner = 0.0;
            }
            float sign = step(0.0, dy) * 2.0 - 1.0;
            pos = doBisect(norm, len, norm2, len2, dy, 0.0);
            if (length(pos) > abs(dy) * u_MiterLimit) {
              type = BEVEL;
            } else {
              if (a_VertexNum < 4.5) {
                dy = -dy;
                pos = doBisect(norm, len, norm2, len2, dy, 1.0);
              } else if (a_VertexNum < 5.5) {
                pos = dy * norm;
              } else if (a_VertexNum > 6.5) {
                pos = dy * norm2;
              }
              v_Type = 1.0;
              dy = -sign * dot(pos, norm);
              dy2 = -sign * dot(pos, norm2);
              hit = 1.0;
            }
          }
          if (type >= BEVEL && type < BEVEL + 1.5) {
            if (inner > 0.5) {
              dy = -dy;
              inner = 0.0;
            }
            float d2 = abs(dy);
            vec2 pos3 = vec2(dy * norm.x - d2 * norm.y, dy * norm.y + d2 * norm.x);
            vec2 pos4 = vec2(dy * norm2.x + d2 * norm2.y, dy * norm2.y - d2 * norm2.x);
            if (a_VertexNum < 4.5) {
              pos = doBisect(norm, len, norm2, len2, -dy, 1.0);
            } else if (a_VertexNum < 5.5) {
              pos = dy * norm;
            } else if (a_VertexNum > 7.5) {
              pos = dy * norm2;
            } else {
              if (a_VertexNum < 6.5) {
                pos = pos3;
              } else {
                pos = pos4;
              }
            }
            vec2 norm3 = normalize(norm + norm2);
            float sign = step(0.0, dy) * 2.0 - 1.0;
            dy = -sign * dot(pos, norm);
            dy2 = -sign * dot(pos, norm2);
            dy3 = (-sign * dot(pos, norm3)) + lineWidth;
            v_Type = 4.0;
            hit = 1.0;
          }
          if (hit < 0.5) {
            gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }
        }
      }
      pos += base;
      v_Distance = vec4(dy, dy2, dy3, lineWidth) * u_DevicePixelRatio;
      v_Arc = v_Arc * u_DevicePixelRatio;
      // vTravel = a_Travel * lineWidth + dot(pos - pointA, vec2(-norm.y, norm.x));
    }

    pos += u_Anchor;

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * vec4(pos, 0.0, 1.0);

    setPickingColor(u_PickingColor.xyz);
  }
  `;

  frag: string = `
in vec4 v_Distance;
in vec4 v_Arc;
in float v_Type;
// int float v_Travel;

in vec4 v_PickingResult;
layout(location = 1) out vec4 gbuf_picking;

void main(){
  gbuf_picking = vec4(v_PickingResult.rgb, 1.0);

  float alpha = 1.0;
  float lineWidth = v_Distance.w;
  if (v_Type < 0.5) {
    float left = max(v_Distance.x - 0.5, -v_Distance.w);
    float right = min(v_Distance.x + 0.5, v_Distance.w);
    float near = v_Distance.y - 0.5;
    float far = min(v_Distance.y + 0.5, 0.0);
    float top = v_Distance.z - 0.5;
    float bottom = min(v_Distance.z + 0.5, 0.0);
    alpha = max(right - left, 0.0) * max(bottom - top, 0.0) * max(far - near, 0.0);
  } else if (v_Type < 1.5) {
    float a1 = clamp(v_Distance.x + 0.5 - lineWidth, 0.0, 1.0);
    float a2 = clamp(v_Distance.x + 0.5 + lineWidth, 0.0, 1.0);
    float b1 = clamp(v_Distance.y + 0.5 - lineWidth, 0.0, 1.0);
    float b2 = clamp(v_Distance.y + 0.5 + lineWidth, 0.0, 1.0);
    alpha = a2 * b2 - a1 * b1;
  } else if (v_Type < 2.5) {
    alpha *= max(min(v_Distance.x + 0.5, 1.0), 0.0);
    alpha *= max(min(v_Distance.y + 0.5, 1.0), 0.0);
    alpha *= max(min(v_Distance.z + 0.5, 1.0), 0.0);
  } else if (v_Type < 3.5) {
    float a1 = clamp(v_Distance.x + 0.5 - lineWidth, 0.0, 1.0);
    float a2 = clamp(v_Distance.x + 0.5 + lineWidth, 0.0, 1.0);
    float b1 = clamp(v_Distance.y + 0.5 - lineWidth, 0.0, 1.0);
    float b2 = clamp(v_Distance.y + 0.5 + lineWidth, 0.0, 1.0);
    float alpha_miter = a2 * b2 - a1 * b1;
    float alpha_plane = max(min(v_Distance.z + 0.5, 1.0), 0.0);
    float d = length(v_Arc.xy);
    float circle_hor = max(min(v_Arc.w, d + 0.5) - max(-v_Arc.w, d - 0.5), 0.0);
    float circle_vert = min(v_Arc.w * 2.0, 1.0);
    float alpha_circle = circle_hor * circle_vert;
    alpha = min(alpha_miter, max(alpha_circle, alpha_plane));
  } else {
    float a1 = clamp(v_Distance.x + 0.5 - lineWidth, 0.0, 1.0);
    float a2 = clamp(v_Distance.x + 0.5 + lineWidth, 0.0, 1.0);
    float b1 = clamp(v_Distance.y + 0.5 - lineWidth, 0.0, 1.0);
    float b2 = clamp(v_Distance.y + 0.5 + lineWidth, 0.0, 1.0);
    alpha = a2 * b2 - a1 * b1;
    alpha *= max(min(v_Distance.z + 0.5, 1.0), 0.0);
  }

  // if (u_Dash + u_Gap > 1.0) {
  //   float travel = mod(v_Travel + u_Gap * 0.5, u_Dash + u_Gap) - (u_Gap * 0.5);
  //   float left = max(travel - 0.5, -0.5);
  //   float right = min(travel + 0.5, u_Gap + 0.5);
  //   alpha *= max(0.0, right - left);
  // }

  gl_FragColor = u_StrokeColor * alpha;
  gl_FragColor.a = gl_FragColor.a * u_StrokeOpacity;
}
`;
}

@injectable({
  token: [
    { token: ShapeRenderer, named: SHAPE.Path },
    { token: ShapeRenderer, named: SHAPE.Polygon },
  ],
})
export class LineRenderer extends Batch {
  protected program = new LineProgram();

  instanced = false;

  validate(object: DisplayObject) {
    return false;
  }

  buildGeometry() {
    const geometry = this.geometry;
    const object = this.objects[0];

    // TODO: use triangles for Polygon
    let { triangles, pointsBuffer, instanceCount } = this.updateBuffer(object);

    geometry.setVertexBuffer({
      bufferIndex: 0,
      byteStride: 4 * (3 + 3 + 3 + 3),
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 3,
          location: LineProgram.a_Prev,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 3,
          byteStride: 4 * 3,
          location: LineProgram.a_Point1,
          divisor: 1,
        },
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 5,
          byteStride: 4 * 3,
          location: LineProgram.a_VertexJoint,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 6,
          byteStride: 4 * 3,
          location: LineProgram.a_Point2,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 9,
          byteStride: 4 * 3,
          location: LineProgram.a_Next,
          divisor: 1,
        },
      ],
      data: new Float32Array(pointsBuffer),
    });
    geometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 1,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 1,
          location: LineProgram.a_VertexNum,
          divisor: 0,
        },
      ],
      data: new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    });

    geometry.vertexCount = 15;
    geometry.maxInstancedCount = instanceCount;

    geometry.setIndices(new Uint32Array([0, 2, 1, 0, 3, 2, 4, 6, 5, 4, 7, 6, 4, 7, 8]));
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    super.updateAttribute(object, name, value);

    if (
      name === 'lineJoin' ||
      name === 'lineCap' ||
      (object.nodeName === SHAPE.Line &&
        (name === 'x1' || name === 'y1' || name === 'x2' || name === 'y2')) ||
      (object.nodeName === SHAPE.Polyline && name === 'points') ||
      (object.nodeName === SHAPE.Polygon && name === 'points') ||
      (object.nodeName === SHAPE.Path && name === 'path')
    ) {
      this.recreateGeometry = true;
    }
  }

  uploadUBO(renderInst: RenderInst): void {
    const instance = this.objects[0];

    const { fill, stroke, opacity, fillOpacity, strokeOpacity, lineWidth, anchor, zIndex } =
      instance.parsedStyle;
    let fillColor: Tuple4Number = [0, 0, 0, 0];
    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      fillColor = fill.value;
    }
    let strokeColor: Tuple4Number = [0, 0, 0, 0];
    if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
      strokeColor = stroke.value;
    }

    const encodedPickingColor = instance.entity.getComponent(Renderable3D).encodedPickingColor;
    let translateX = 0;
    let translateY = 0;
    const contentBounds = instance.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;
      translateX = -halfExtents[0] * anchor[0] * 2;
      translateY = -halfExtents[1] * anchor[1] * 2;
    }

    // Upload to our UBO.
    let offs = renderInst.allocateUniformBuffer(LineProgram.ub_ObjectParams, 16 + 4 * 6);
    const d = renderInst.mapUniformBufferF32(LineProgram.ub_ObjectParams);
    offs += fillMatrix4x4(d, offs, instance.getWorldTransform());
    offs += fillVec4(d, offs, ...fillColor);
    offs += fillVec4(d, offs, ...strokeColor);
    offs += fillVec4(d, offs, lineWidth, opacity, fillOpacity, strokeOpacity);
    offs += fillVec4(d, offs, 1, 5, 1, 0.5); // u_Expand u_MiterLimit u_ScaleMode u_Alignment
    offs += fillVec4(d, offs, ...encodedPickingColor);
    offs += fillVec4(d, offs, 5, 8, translateX, translateY); // u_Dash u_Gap u_Anchor

    // keep both faces
    renderInst.setMegaStateFlags({
      cullMode: CullMode.None,
    });
  }

  private updateBuffer(object: DisplayObject) {
    const { lineCap, lineJoin, defX, defY } = object.parsedStyle;

    let points: number[] = [];
    let triangles: number[] = [];
    if (object.nodeName === SHAPE.Line) {
      const line = object as Line;
      const { x1, y1, x2, y2 } = line.parsedStyle;
      points = [x1 - defX, y1 - defY, x2 - defX, y2 - defY];
    } else if (object.nodeName === SHAPE.Polyline || object.nodeName === SHAPE.Polygon) {
      points = (object as Polyline).parsedStyle.points.points.reduce((prev, cur) => {
        prev = [...prev, ...[cur[0] - defX, cur[1] - defY]];
        return prev;
      }, [] as number[]);

      // TODO: close polygon, dealing with extra joint
      if (object.nodeName === SHAPE.Polygon) {
        points.push(points[0], points[1]);

        // use earcut for triangulation
        triangles = earcut(points, [], 2);
      }
    } else if (object.nodeName === SHAPE.Path) {
      const {
        path: { curve, totalLength },
      } = (object as Path).parsedStyle;
      let startPoint: [number, number];
      curve.forEach(([command, ...params]) => {
        if (command === 'M') {
          points.push(params[0] - defX, params[1] - defY);
          startPoint = [params[0] - defX, params[1] - defY];
        } else if (command === 'C') {
          curveTo(
            params[0] - defX,
            params[1] - defY,
            params[2] - defX,
            params[3] - defY,
            params[4] - defX,
            params[5] - defY,
            totalLength,
            points,
          );
        } else if (command === 'Z') {
          points.push(startPoint[0], startPoint[1]);
        }
      });
    }

    const jointType = this.jointType(lineJoin);
    const capType = this.capType(lineCap);
    let endJoint = capType;
    if (capType === JOINT_TYPE.CAP_ROUND) {
      endJoint = JOINT_TYPE.JOINT_CAP_ROUND;
    }
    if (capType === JOINT_TYPE.CAP_BUTT) {
      endJoint = JOINT_TYPE.JOINT_CAP_BUTT;
    }
    if (capType === JOINT_TYPE.CAP_SQUARE) {
      endJoint = JOINT_TYPE.JOINT_CAP_SQUARE;
    }

    let j = (Math.round(0 / stridePoints) + 2) * strideFloats;

    const pointsBuffer = [];
    for (let i = 0; i < points.length; i += stridePoints) {
      pointsBuffer[j++] = points[i];
      pointsBuffer[j++] = points[i + 1];
      pointsBuffer[j] = jointType;
      if (i == 0 && capType !== JOINT_TYPE.CAP_ROUND) {
        pointsBuffer[j] += capType;
      }
      if (i + stridePoints * 2 >= points.length) {
        pointsBuffer[j] += endJoint - jointType;
      } else if (i + stridePoints >= points.length) {
        pointsBuffer[j] = 0;
      }
      j++;
    }
    pointsBuffer[j++] = points[points.length - 4];
    pointsBuffer[j++] = points[points.length - 3];
    pointsBuffer[j++] = 0;
    pointsBuffer[0] = points[0];
    pointsBuffer[1] = points[1];
    pointsBuffer[2] = 0;
    pointsBuffer[3] = points[2];
    pointsBuffer[4] = points[3];
    pointsBuffer[5] = capType === JOINT_TYPE.CAP_ROUND ? capType : 0;

    const instanceCount = Math.round(points.length / stridePoints);

    return {
      pointsBuffer,
      triangles,
      instanceCount,
    };
  }

  private jointType(lineJoin: LINE_JOIN) {
    let joint: number;

    switch (lineJoin) {
      case LINE_JOIN.Bevel:
        joint = JOINT_TYPE.JOINT_BEVEL;
        break;
      case LINE_JOIN.Round:
        joint = JOINT_TYPE.JOINT_ROUND;
        break;
      default:
        joint = JOINT_TYPE.JOINT_MITER;
        break;
    }

    return joint;
  }

  private capType(lineCap: LINE_CAP) {
    let cap: number;

    switch (lineCap) {
      case LINE_CAP.Square:
        cap = JOINT_TYPE.CAP_SQUARE;
        break;
      case LINE_CAP.Round:
        cap = JOINT_TYPE.CAP_ROUND;
        break;
      default:
        cap = JOINT_TYPE.CAP_BUTT;
        break;
    }

    return cap;
  }
}

function curveTo(
  cpX: number,
  cpY: number,
  cpX2: number,
  cpY2: number,
  toX: number,
  toY: number,
  curveLength: number,
  points: Array<number>,
): void {
  const fromX = points[points.length - 2];
  const fromY = points[points.length - 1];

  points.length -= 2;

  const n = segmentsCount(curveLength);

  let dt = 0;
  let dt2 = 0;
  let dt3 = 0;
  let t2 = 0;
  let t3 = 0;

  points.push(fromX, fromY);

  for (let i = 1, j = 0; i <= n; ++i) {
    j = i / n;

    dt = 1 - j;
    dt2 = dt * dt;
    dt3 = dt2 * dt;

    t2 = j * j;
    t3 = t2 * j;

    points.push(
      dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX,
      dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY,
    );
  }
}

const adaptive = true;
const maxLength = 10;
// const minSegments = 8;
// const maxSegments = 2048;

function segmentsCount(length: number, defaultSegments = 20) {
  if (!adaptive || !length || isNaN(length)) {
    return defaultSegments;
  }

  let result = Math.ceil(length / maxLength);

  // if (result < minSegments) {
  //   result = minSegments;
  // } else if (result > maxSegments) {
  //   result = maxSegments;
  // }

  return result;
}
