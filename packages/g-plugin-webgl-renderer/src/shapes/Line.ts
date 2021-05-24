import { DisplayObject, Renderable, SceneGraphNode } from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { ShaderModuleService } from '../services/shader-module';
import lineVertex from './shaders/webgl.line.vert.glsl';
import lineFragment from './shaders/webgl.line.frag.glsl';
import { gl } from '../services/renderer/constants';
import { Material3D } from '../components/Material3D';
import { Geometry3D } from '../components/Geometry3D';
import { Renderable3D } from '../components/Renderable3D';
import { BufferData, RenderingEngine } from '../services/renderer';
import { ModelBuilder } from '.';
import { rgb2arr } from '../utils/color';

const MAX_MITER_LIMIT = 100;

/* Flags are passed to the vertex shader in a float.  Since a 32-bit float has
 * 24 bits of mantissa, including the sign bit, a maximum of 23 bits of flags
 * can be passed in a float without loss or complication.
 *   The flags*Shift values are the bit offsets within the flag value.  The
 * flags*Mult values are the bit-offset values converted to a multiplier (2
 * raised to the offset value).  The overall flags value is composed of:
 *  bits 0-1: vertex (corner, near, far) used by the shader to know where in
 *            the geometry the vertex is used.
 *       2-4: near cap/join style
 *       5-7: far cap/join style
 *       8-18: stroke offset as a signed value in the range [-1023,1023] which
 *             maps to a floating-point stroke offset of [-1,1].
 */
/* vertex flags specify which direction a vertex needs to be offset */
const flagsVertex = {
  // uses 2 bits
  corner: 0,
  near: 1,
  far: 3,
};
const flagsLineCap = {
  // uses 3 bits with flagsLineJoin
  butt: 0,
  square: 1,
  round: 2,
};
const flagsLineJoin = {
  // uses 3 bits with flagsLineCap
  passthrough: 3,
  miter: 4,
  bevel: 5,
  round: 6,
  'miter-clip': 7,
};
const flagsNearLineShift = 2;
const flagsNearLineMult = 1 << flagsNearLineShift;
const flagsFarLineShift = 5;
const flagsFarLineMult = 1 << flagsFarLineShift;
const flagsNearOffsetShift = 8; // uses 11 bits
const flagsNearOffsetMult = 1 << flagsNearOffsetShift;

type FeatureVertice = [number, string, number, number];
const vertices: FeatureVertice[] = [
  [0, 'corner', -1, flagsVertex.corner],
  [0, 'near', 1, flagsVertex.near],
  [1, 'far', -1, flagsVertex.far],
  [1, 'corner', 1, flagsVertex.corner],
  [1, 'near', -1, flagsVertex.near],
  [0, 'far', 1, flagsVertex.far],
];

interface Vertice {
  strokeOffset: number;
  posStrokeOffset: number;
  negStrokeOffset: number;
  pos?: number;
  prev?: number;
  next?: number;
  strokeWidth?: number;
  strokeColor?: number[];
  strokeOpacity?: number;
  flags?: number;
}

interface IImageConfig {
  id: number;
  size: [number, number];
}

interface IInstanceAttributes {
  extrudes: number[];
  instancedSizes: number[];
}

const ATTRIBUTE = {
  Pos: 'a_Pos',
  Prev: 'a_Prev',
  Next: 'a_Next',
  Far: 'a_Far',
  Flags: 'a_Flags',
  StrokeColor: 'a_StrokeColor',
  StrokeOpacity: 'a_StrokeOpacity',
  StrokeWidth: 'a_StrokeWidth',
};

const UNIFORM = {
  Antialiasing: 'u_Antialiasing',
};

/**
 * Render Line & Polyline
 */
@injectable()
export class LineModelBuilder implements ModelBuilder {
  @inject(ShaderModuleService)
  private shaderModule: ShaderModuleService;

  onAttributeChanged(object: DisplayObject, name: string, value: any) {
    const entity = object.getEntity();
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const renderable = entity.getComponent(Renderable);
    const renderable3d = entity.getComponent(Renderable3D);
    // if we are updating sub renderable's attribute
    if (renderable3d.sourceEntity) {
      //
    } else {
      const material = entity.getComponent(Material3D);
      const geometry = entity.getComponent(Geometry3D);
    }
  }

  prepareModel(object: DisplayObject) {
    const entity = object.getEntity();
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);
    const renderable3d = entity.getComponent(Renderable3D);

    const {
      lineWidth = 0,
      lineCap,
      lineJoin,
      stroke = '',
      strokeOpacity = 1,
      x1,
      y1,
      x2,
      y2,
      x = 0,
      y = 0,
      points,
    } = sceneGraphNode.attributes;
    const strokeColor = rgb2arr(stroke);
    const strokeOffset = 0;

    this.shaderModule.registerModule('line', {
      vs: lineVertex,
      fs: lineFragment,
    });
    const { vs, fs, uniforms: extractedUniforms } = this.shaderModule.getModule('line');

    material.vertexShaderGLSL = vs || '';
    material.fragmentShaderGLSL = fs || '';
    material.cull = {
      enable: true,
    };
    material.depth = {
      enable: false,
    };
    material.blend = {
      enable: true,
      func: {
        srcRGB: gl.SRC_ALPHA,
        dstRGB: gl.ONE_MINUS_SRC_ALPHA,
      },
    };
    material.setUniform({
      ...(extractedUniforms as Record<string, BufferData>),
      // [UNIFORM.Antialiasing]: 2,
    });

    const data: [number, number, number][][] = points
      ? [points.map(([xx1, yy1]) => [xx1 - x, yy1 - y])]
      : [
          [
            [x1 - x, y1 - y, 0],
            [x2 - x, y2 - y, 0],
          ],
        ];

    const position: number[] = [];
    const lineItemList = new Array(data.length);
    const closed = new Array(data.length);
    let closedVal;
    let d;
    let pos: number[] = [];
    let numSegments = 0;
    let lineItem: [number, number, number][];
    let firstpos: number[] = [];
    for (let i = 0; i < data.length; i += 1) {
      d = data[i];
      lineItem = d;
      lineItemList[i] = lineItem;
      if (lineItem.length < 2) {
        continue;
      }
      numSegments += lineItem.length - 1;
      for (let j = 0; j < lineItem.length; j += 1) {
        pos = lineItem[j];
        position.push(pos[0]);
        position.push(pos[1]);
        position.push(0.0);
        if (!j) {
          firstpos = pos;
        }
      }
      if (lineItem.length > 2 && closedVal) {
        /* line is closed */
        if (pos[0] !== firstpos[0] || pos[1] !== firstpos[1] || pos[2] !== firstpos[2]) {
          numSegments += 1;
          closed[i] = 2; /* first and last points are distinct */
        } else {
          closed[i] = 1; /* first point is repeated as last point */
        }
      } else {
        closed[i] = 0;
      }
    }

    let posIdx3;
    let dest;
    let dest3;
    let firstPosIdx3;
    let maxj;
    let lidx;
    let lineItemData: [number, number, number];
    let vert: Vertice[] = [
      {
        strokeOffset: 0,
        posStrokeOffset: 0,
        negStrokeOffset: 0,
      },
      {
        strokeOffset: 0,
        posStrokeOffset: 0,
        negStrokeOffset: 0,
      },
    ];
    let v = vert[1];
    let order = vertices;
    let orderLen = order.length;
    let orderk0: number;
    let v1;
    let v2;
    let updateFlags = true;
    let onlyStyle = false;

    const posBuf = [];
    const prevBuf = [];
    const nextBuf = [];
    const farBuf = [];
    const flagsBuf = [];
    const strokeWidthBuf = [];
    const strokeColorBuf = [];
    const strokeOpacityBuf = [];
    const indicesBuf = [];

    for (let i = (posIdx3 = dest = dest3 = 0); i < data.length; i += 1) {
      lineItem = lineItemList[i];
      if (lineItem.length < 2) {
        continue;
      }
      d = data[i];
      closedVal = closed[i];
      firstPosIdx3 = posIdx3;
      maxj = lineItem.length + (closedVal === 2 ? 1 : 0);
      for (let j = 0; j < maxj; j += 1, posIdx3 += 3) {
        lidx = j;
        if (j === lineItem.length) {
          lidx = 0;
          posIdx3 -= 3;
        }
        lineItemData = lineItem[lidx];
        /* swap entries in vert so that vert[0] is the first vertex, and
         * vert[1] will be reused for the second vertex */
        if (j) {
          v = vert[0];
          vert[0] = vert[1];
          vert[1] = v;
        }
        if (!onlyStyle) {
          v.pos = j === lidx ? posIdx3 : firstPosIdx3;
          v.prev = lidx ? posIdx3 - 3 : closedVal ? firstPosIdx3 + (lineItem.length - 3 + closedVal) * 3 : posIdx3;
          v.next =
            j + 1 < lineItem.length
              ? posIdx3 + 3
              : closedVal
              ? j !== lidx
                ? firstPosIdx3 + 3
                : firstPosIdx3 + 6 - closedVal * 3
              : posIdx3;
        }
        v.strokeWidth = lineWidth * 2;
        v.strokeColor = strokeColor;
        v.strokeOpacity = strokeOpacity;
        if (updateFlags) {
          if (strokeOffset !== 0) {
            v.strokeOffset = strokeOffset || 0;
            if (v.strokeOffset) {
              /* we use 11 bits to store the offset, and we want to store values
               * from -1 to 1, so multiply our values by 1023, and use some bit
               * manipulation to ensure that it is packed properly */
              v.posStrokeOffset = Math.round(2048 + 1023 * Math.min(1, Math.max(-1, v.strokeOffset))) & 0x7ff;
              v.negStrokeOffset = Math.round(2048 - 1023 * Math.min(1, Math.max(-1, v.strokeOffset))) & 0x7ff;
            } else {
              v.posStrokeOffset = v.negStrokeOffset = 0;
            }
          }
          if (!closedVal && (!j || j === lineItem.length - 1)) {
            v.flags = (lineCap && flagsLineCap[lineCap]) || flagsLineCap.butt;
          } else {
            v.flags = (lineJoin && flagsLineJoin[lineJoin]) || flagsLineJoin.miter;
          }
        }

        if (j) {
          /* zero out the z position.  This can be changed if we handle it in
           * the shader. */
          let prevkey;
          let nextkey;
          let offkey;
          for (let k = 0; k < orderLen; k += 1, dest += 1, dest3 += 3) {
            orderk0 = order[k][0];
            v1 = vert[orderk0];
            v2 = vert[1 - orderk0];
            if (!onlyStyle) {
              posBuf[dest3] = position[v1.pos];
              posBuf[dest3 + 1] = position[v1.pos + 1];
              posBuf[dest3 + 2] = 0; // position[v1.pos + 2];
              prevkey = !orderk0 ? 'prev' : 'next';
              nextkey = !orderk0 ? 'next' : 'prev';
              prevBuf[dest3] = position[v1[prevkey]];
              prevBuf[dest3 + 1] = position[v1[prevkey] + 1];
              prevBuf[dest3 + 2] = 0; // position[v1[prevkey] + 2];
              nextBuf[dest3] = position[v1[nextkey]];
              nextBuf[dest3 + 1] = position[v1[nextkey] + 1];
              nextBuf[dest3 + 2] = 0; // position[v1[nextkey] + 2];
              farBuf[dest3] = position[v2[nextkey]];
              farBuf[dest3 + 1] = position[v2[nextkey] + 1];
              farBuf[dest3 + 2] = 0; // position[v2[nextkey] + 2];
            }
            if (updateFlags) {
              offkey = !orderk0 ? 'negStrokeOffset' : 'posStrokeOffset';
              flagsBuf[dest] =
                order[k][3] +
                v1.flags * flagsNearLineMult +
                v2.flags * flagsFarLineMult +
                v1[offkey] * flagsNearOffsetMult;
            }
            strokeWidthBuf[dest] = v1.strokeWidth;
            strokeColorBuf[dest3] = v1.strokeColor[0];
            strokeColorBuf[dest3 + 1] = v1.strokeColor[1];
            strokeColorBuf[dest3 + 2] = v1.strokeColor[2];
            if ((v1.strokeOpacity <= 0 && v2.strokeOpacity <= 0) || (v1.strokeWidth <= 0 && v2.strokeWidth <= 0)) {
              strokeOpacityBuf[dest] = -1;
            } else {
              strokeOpacityBuf[dest] = v1.strokeOpacity;
            }
          }
        }
      }
    }

    // let config: Partial<IImageConfig>[] = [];
    // if (instancing) {
    //   config = renderable3d.instanceEntities.map((subEntity) => {
    //     const { attributes } = subEntity.getComponent(SceneGraphNode);
    //     return {
    //       size: [attributes.width || 0, attributes.height || 0],
    //     };
    //   });
    // } else {
    //   config.push({
    //     size: [width, height],
    //   });
    // }

    // const attributes = this.buildAttributes(config);

    // geometry.maxInstancedCount = attributes.instancedSizes.length / 2;
    // indicesBuf.push();

    geometry.vertexCount = strokeOpacityBuf.length;
    for (let i = 0; i < strokeOpacityBuf.length; i += 6) {
      indicesBuf.push(i, 2 + i, 1 + i, 2 + i, 3 + i, 1 + i);
    }

    geometry.setIndex(indicesBuf);

    geometry.setAttribute(ATTRIBUTE.Pos, Float32Array.from(posBuf), {
      arrayStride: 4 * 3,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float3',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Prev, Float32Array.from(prevBuf), {
      arrayStride: 4 * 3,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 1,
          offset: 0,
          format: 'float3',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Next, Float32Array.from(nextBuf), {
      arrayStride: 4 * 3,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 2,
          offset: 0,
          format: 'float3',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Far, Float32Array.from(farBuf), {
      arrayStride: 4 * 3,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 3,
          offset: 0,
          format: 'float3',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Flags, Float32Array.from(flagsBuf), {
      arrayStride: 4 * 1,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 4,
          offset: 0,
          format: 'float',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.StrokeColor, Float32Array.from(strokeColorBuf), {
      arrayStride: 4 * 3,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 3,
          offset: 0,
          format: 'float3',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.StrokeWidth, Float32Array.from(strokeWidthBuf), {
      arrayStride: 4 * 1,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 4,
          offset: 0,
          format: 'float',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.StrokeOpacity, Float32Array.from(strokeOpacityBuf), {
      arrayStride: 4 * 1,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 4,
          offset: 0,
          format: 'float',
        },
      ],
    });
  }

  private buildAttribute(config: Partial<IImageConfig>, attributes: IInstanceAttributes, index: number) {
    attributes.instancedSizes.push(...(config.size || [0.2, 0.2]));
  }

  private buildAttributes(config: Partial<IImageConfig> | Array<Partial<IImageConfig>>) {
    const attributes: IInstanceAttributes = {
      extrudes: [0, 0, 1, 0, 1, 1, 0, 1],
      instancedSizes: [],
    };

    if (Array.isArray(config)) {
      config.forEach((c, i) => {
        this.buildAttribute(c, attributes, i);
      });
    } else {
      this.buildAttribute(config, attributes, 0);
    }

    return attributes;
  }
}
