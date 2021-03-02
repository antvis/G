import { Renderable } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { ShaderModuleService } from '../services/shader-module';
import { BaseRenderer } from './Base';
import circleVertex from './shaders/webgl.circle.vert.glsl';
import circleFragment from './shaders/webgl.circle.frag.glsl';
import { rgb2arr } from '../utils/color';
import { gl } from '../services/renderer/constants';
import { Material3D } from '../components/Material3D';
import { Geometry3D } from '../components/Geometry3D';
import { encodePickingColor } from '../utils/math';

const pointShapes = ['circle', 'triangle', 'square', 'pentagon', 'hexagon', 'octogon', 'hexagram', 'rhombus', 'vesica'];

interface IPointConfig {
  id: number;
  shape: 'circle' | 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'octogon' | 'hexagram' | 'rhombus' | 'vesica';
  position: [number, number];
  size: [number, number];
  color: [number, number, number, number]; // sRGB
  opacity: number;
  strokeWidth: number;
  strokeOpacity: number;
  strokeColor: [number, number, number, number]; // sRGB
}

interface IInstanceAttributes {
  positions: number[];
  instancedOffsets: number[];
  instancedColors: number[];
  instancedSizes: number[];
  instancedShapes: number[];
  instancedPickingColors: number[];
}

@injectable()
export class CircleRenderer extends BaseRenderer {
  @inject(ShaderModuleService)
  private shaderModule: ShaderModuleService;

  buildModel(entity: Entity) {
    const renderable = entity.getComponent(Renderable);
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);

    const {
      x = 0,
      y = 0,
      r = 1,
      fill = '',
      fillOpacity = 1,
      stroke = '',
      strokeOpacity = 1,
      lineWidth = 1,
    } = renderable.attrs;

    const fillColor = rgb2arr(fill);
    const strokeColor = rgb2arr(stroke);

    this.shaderModule.registerModule('circle', {
      vs: circleVertex,
      fs: circleFragment,
    });
    const { vs, fs, uniforms: extractedUniforms } = this.shaderModule.getModule('circle');

    material.vertexShaderGLSL = vs || '';
    material.fragmentShaderGLSL = fs || '';
    material.cull = {
      enable: false,
    };
    material.depth = {
      enable: false,
    };
    material.blend = {
      enable: true,
      func: {
        srcRGB: gl.SRC_ALPHA,
        dstRGB: gl.ONE_MINUS_SRC_ALPHA,
        srcAlpha: 1,
        dstAlpha: 1,
      },
    };

    // TODO: support define stroke-relative props per point
    material.setUniform({
      ...extractedUniforms,
      u_device_pixel_ratio: window.devicePixelRatio,
      u_stroke_color: strokeColor,
      u_stroke_width: lineWidth,
    });

    const attributes = this.buildAttributes({
      position: [x, y],
      size: [r, r],
      shape: 'circle',
      color: fillColor as [number, number, number, number], // sRGB
      opacity: fillOpacity,
      strokeOpacity,
      strokeColor: strokeColor as [number, number, number, number], // sRGB
    });

    geometry.maxInstancedCount = attributes.instancedOffsets.length / 2;
    geometry.vertexCount = 6;

    geometry.setIndex([0, 2, 1, 0, 3, 2]);

    geometry.setAttribute('a_extrude', Float32Array.from(attributes.positions), {
      arrayStride: 4 * 2,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float2',
        },
      ],
    });

    geometry.setAttribute('a_position', Float32Array.from(attributes.instancedOffsets), {
      arrayStride: 4 * 2,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 1,
          offset: 0,
          format: 'float2',
        },
      ],
    });

    geometry.setAttribute('a_color', Float32Array.from(attributes.instancedColors), {
      arrayStride: 4 * 4,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 2,
          offset: 0,
          format: 'float4',
        },
      ],
    });

    geometry.setAttribute('a_size', Float32Array.from(attributes.instancedSizes), {
      arrayStride: 4,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 3,
          offset: 0,
          format: 'float',
        },
      ],
    });

    geometry.setAttribute('a_shape', Float32Array.from(attributes.instancedShapes), {
      arrayStride: 4,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 4,
          offset: 0,
          format: 'float',
        },
      ],
    });

    geometry.setAttribute('a_PickingColor', Float32Array.from(attributes.instancedPickingColors), {
      arrayStride: 4 * 3,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 6,
          offset: 0,
          format: 'float3',
        },
      ],
    });
  }

  private buildAttribute(config: Partial<IPointConfig>, attributes: IInstanceAttributes, index: number) {
    attributes.instancedPickingColors.push(...encodePickingColor(config.id || index));

    attributes.instancedShapes.push(pointShapes.indexOf(config.shape || 'circle'));
    attributes.instancedColors.push(...(config.color || [1, 0, 0, 1]));
    attributes.instancedOffsets.push(...(config.position || [0, 0]));
    attributes.instancedSizes.push(...(config.size || [0.2, 0.2]));
  }

  private buildAttributes(config: Partial<IPointConfig> | Array<Partial<IPointConfig>>) {
    const attributes: IInstanceAttributes = {
      positions: [1, 1, 1, -1, -1, -1, -1, 1],
      instancedOffsets: [],
      instancedColors: [],
      instancedSizes: [],
      instancedShapes: [],
      instancedPickingColors: [],
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
