import { DisplayObject, LineStyleProps, Renderable, SceneGraphNode } from '@antv/g';
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

const LINE_CAPS: Record<'round' | 'butt' | 'square', number> = {
  square: 0,
  butt: 1,
  round: 2,
};

const LINE_JOINS: Record<'miter' | 'bevel' | 'round', number> = {
  miter: 0,
  round: 1,
  bevel: 2,
};

const PATH_TYPE = {
  line: 0,
  quadratic: 1,
  arc: 2,
};

const ATTRIBUTE = {
  Pos: 'in_position',
  Prev: 'in_prevPos',
  Next: 'in_nextPos',
  Start: 'in_startPos',
  End: 'in_endPos',
  Cp: 'in_cp',
  Type: 'in_type',
  Color: 'in_color',
};

const UNIFORM = {
  LineWidth: 'u_lineWidth',
  LineJoin: 'u_lineJoin',
  LineCap: 'u_lineCap',
};

/**
 * Render Line & Polyline
 */
@injectable()
export class LineModelBuilder implements ModelBuilder {
  @inject(ShaderModuleService)
  private shaderModule: ShaderModuleService;

  onAttributeChanged(object: DisplayObject<LineStyleProps>, name: string, value: any) {
    const entity = object.getEntity();
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const renderable = entity.getComponent(Renderable);
    const renderable3d = entity.getComponent(Renderable3D);
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);

    if (name === 'lineWidth') {
      material.setUniform({
        [UNIFORM.LineWidth]: value,
      });
    }
  }

  prepareModel(object: DisplayObject<LineStyleProps>) {
    const entity = object.getEntity();
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);
    const renderable3d = entity.getComponent(Renderable3D);

    const {
      lineWidth = 1,
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
      [UNIFORM.LineWidth]: lineWidth,
      // @ts-ignore
      [UNIFORM.LineCap]: LINE_CAPS[lineCap], // "round" | "butt" | "square"
      // @ts-ignore
      [UNIFORM.LineJoin]: LINE_JOINS[lineJoin], // "miter" | "bevel" | "round"
    });

    geometry.vertexCount = 6;
    geometry.maxInstancedCount = 1;
    // geometry.setIndex([0, 1, 2, 1, 3, 2]);
    geometry.setIndex([0, 2, 1, 0, 3, 2]);

    geometry.setAttribute(
      ATTRIBUTE.Pos,
      Float32Array.from(
        // [0, 0, 1, 0, 1, 1, 0, 1],
        // [-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5]
        [-1, -1, 1, -1, 1, 1, -1, 1]
      ),
      {
        arrayStride: 4 * 2,
        stepMode: 'vertex',
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: 'float2',
          },
        ],
      },
    );

    geometry.setAttribute(ATTRIBUTE.Start, Float32Array.from([x1, y1]), {
      arrayStride: 4 * 2,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float2',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.End, Float32Array.from([x2, y2]), {
      arrayStride: 4 * 2,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float2',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Prev, Float32Array.from([0, 0]), {
      arrayStride: 4 * 2,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float2',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Next, Float32Array.from([0, 0]), {
      arrayStride: 4 * 2,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float2',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Type, Float32Array.from([0]), {
      arrayStride: 4 * 1,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Cp, Float32Array.from([0, 0, 0, 0]), {
      arrayStride: 4 * 4,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float4',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Color, Float32Array.from(strokeColor), {
      arrayStride: 4 * 4,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 1,
          offset: 0,
          format: 'float4',
        },
      ],
    });

    console.log(geometry, material);
  }

  // private buildAttribute(config: Partial<IImageConfig>, attributes: IInstanceAttributes, index: number) {
  //   attributes.instancedSizes.push(...(config.size || [0.2, 0.2]));
  // }

  // private buildAttributes(config: Partial<IImageConfig> | Array<Partial<IImageConfig>>) {
  //   const attributes: IInstanceAttributes = {
  //     extrudes: [0, 0, 1, 0, 1, 1, 0, 1],
  //     instancedSizes: [],
  //   };

  //   if (Array.isArray(config)) {
  //     config.forEach((c, i) => {
  //       this.buildAttribute(c, attributes, i);
  //     });
  //   } else {
  //     this.buildAttribute(config, attributes, 0);
  //   }

  //   return attributes;
  // }
}
