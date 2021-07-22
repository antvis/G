import {
  Batch,
  CircleStyleProps,
  DisplayObject,
  DisplayObjectPool,
  SceneGraphNode,
  SHAPE,
} from '@antv/g';
import { inject, injectable } from 'inversify';
import { ShaderModuleService } from '../services/shader-module';
import circleVertex from './shaders/webgl.circle.vert.glsl';
import circleFragment from './shaders/webgl.circle.frag.glsl';
import { gl } from '../services/renderer/constants';
import { Material3D } from '../components/Material3D';
import { Geometry3D } from '../components/Geometry3D';
import { Renderable3D } from '../components/Renderable3D';
import { BufferData } from '../services/renderer';
import { ModelBuilder } from '.';
import { rgb2arr } from '../utils/color';

const pointShapes = ['circle', 'ellipse', 'rect', 'rounded-rect'];

interface IPointConfig {
  id: number;
  shape: 'circle' | 'ellipse' | 'rect';
  size: [number, number];
  color: [number, number, number, number]; // sRGB
  opacity: number;
  strokeWidth: number;
  strokeOpacity: number;
  strokeColor: [number, number, number, number]; // sRGB
}

interface IInstanceAttributes {
  extrudes: number[];
  instancedColors: number[];
  instancedSizes: number[];
}

const ATTRIBUTE = {
  Size: 'a_Size',
  Color: 'a_Color',
  Extrude: 'a_Extrude',
};

const UNIFORM = {
  Shape: 'u_Shape',
  Opacity: 'u_Opacity',
  StrokeColor: 'u_StrokeColor',
  StrokeWidth: 'u_StrokeWidth',
  StrokeOpacity: 'u_StrokeOpacity',
  RectRadius: 'u_RectRadius',
  Anchor: 'u_Anchor',
};

/**
 * Render circle/ellipse/rect/rounded-rect with SDF
 */
@injectable()
export class CircleModelBuilder implements ModelBuilder {
  @inject(ShaderModuleService)
  private shaderModule: ShaderModuleService;

  // createOrUpdateAttribute(attributeName: keyof CircleStyleProps, objects: DisplayObject<CircleStyleProps>[]) {
  //   const entity = object.getEntity();
  //   const geometry = entity.getComponent(Geometry3D);

  //   if (attributeName === 'r') {
  //     geometry.setAttribute(ATTRIBUTE.Size, Float32Array.from(attributes.instancedSizes), {
  //       arrayStride: 4 * 2,
  //       stepMode: 'instance',
  //       attributes: [
  //         {
  //           shaderLocation: 3,
  //           offset: 0,
  //           format: 'float2',
  //         },
  //       ],
  //     });
  //   }
  // }

  onAttributeChanged(object: DisplayObject<CircleStyleProps>, name: string, value: any) {
    const entity = object.getEntity();
    const renderable = entity.getComponent(SceneGraphNode);
    const renderable3d = entity.getComponent(Renderable3D);
    // if we are updating sub renderable's attribute
    if (renderable3d && renderable3d.source && renderable3d.sourceEntity) {
      const sourceGeometry = renderable3d.sourceEntity.getComponent(Geometry3D);
      // TODO: update subdata in this buffer
      const { r = 0, lineWidth = 0, rx = 0, ry = 0 } = renderable.attributes;
      const index = renderable3d.source.instances.indexOf(renderable3d);
      if (name === 'r') {
        const sizeAttribute = sourceGeometry.getAttribute(ATTRIBUTE.Size);
        if (sizeAttribute) {
          sizeAttribute.buffer?.updateBuffer({
            data: Float32Array.from([value - lineWidth / 2, value - lineWidth / 2]),
            offset: index * Float32Array.BYTES_PER_ELEMENT * 2,
          });
        }
      }
    } else {
      const material = entity.getComponent(Material3D);
      const geometry = entity.getComponent(Geometry3D);

      if (material && geometry) {
        const {
          r = 0,
          lineWidth = 0,
          rx = 0,
          ry = 0,
          width = 0,
          height = 0,
        } = renderable.attributes;
        if (name === 'fill') {
          const fillColor = rgb2arr(value);
          geometry.setAttribute(ATTRIBUTE.Color, Float32Array.from(fillColor));
        } else if (name === 'stroke') {
          const strokeColor = rgb2arr(value);
          material.setUniform(UNIFORM.StrokeColor, strokeColor);
        } else if (name === 'strokeOpacity') {
          material.setUniform(UNIFORM.StrokeOpacity, value);
        } else if (name === 'r') {
          geometry.setAttribute(
            ATTRIBUTE.Size,
            Float32Array.from([value + lineWidth / 2, value + lineWidth / 2]),
          );
        } else if (name === 'rx') {
          geometry.setAttribute(
            ATTRIBUTE.Size,
            Float32Array.from([value + lineWidth / 2, ry + lineWidth / 2]),
          );
        } else if (name === 'ry') {
          geometry.setAttribute(
            ATTRIBUTE.Size,
            Float32Array.from([rx + lineWidth / 2, value + lineWidth / 2]),
          );
        } else if (name === 'width') {
          geometry.setAttribute(
            ATTRIBUTE.Size,
            Float32Array.from([value / 2 + lineWidth / 2, height / 2 + lineWidth / 2]),
          );
        } else if (name === 'height') {
          geometry.setAttribute(
            ATTRIBUTE.Size,
            Float32Array.from([width / 2 + lineWidth / 2, value / 2 + lineWidth / 2]),
          );
        } else if (name === 'lineWidth') {
          // 改变线宽时需要同时修改半径，保持与 Canvas 渲染效果一致
          geometry.setAttribute(
            ATTRIBUTE.Size,
            Float32Array.from([
              (rx || r || width / 2) + value / 2,
              (ry || r || height / 2) + value / 2,
            ]),
          );
          material.setUniform(UNIFORM.StrokeWidth, value);
        } else if (name === 'radius') {
          material.setUniform(UNIFORM.RectRadius, value);
        }
      }
    }
  }

  prepareModel(object: DisplayObject<CircleStyleProps>) {
    const entity = object.getEntity();
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);

    const isBatch = sceneGraphNode.tagName === Batch.tag;
    let tagName = sceneGraphNode.tagName;
    if (isBatch) {
      tagName = (object as Batch).getBatchType()!;
    }

    const {
      fill = '',
      fillOpacity = 1,
      stroke = '',
      strokeOpacity = 1,
      lineWidth = 0,
      radius = 0,
    } = isBatch
        ? ((object as Batch).children[0] as DisplayObject).attributes
        : sceneGraphNode.attributes;

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
      enable: true,
    };
    material.depth = {
      enable: false,
    };
    material.blend = {
      enable: true,
      func: {
        // @see https://learnopengl.com/Advanced-OpenGL/Blending
        srcRGB: gl.SRC_ALPHA,
        dstRGB: gl.ONE_MINUS_SRC_ALPHA,
      },
    };

    // TODO: support define stroke-relative props per point
    material.setUniform({
      ...(extractedUniforms as Record<string, BufferData>),
      [UNIFORM.Shape]: pointShapes.indexOf(tagName),
      [UNIFORM.StrokeColor]: strokeColor,
      [UNIFORM.StrokeWidth]: lineWidth,
      [UNIFORM.StrokeOpacity]: strokeOpacity,
      [UNIFORM.RectRadius]: radius,
      [UNIFORM.Anchor]: tagName === SHAPE.Rect ? [1, 1] : [0, 0],
    });

    let config: Partial<IPointConfig>[] = [];

    console.log('isBatch', isBatch);

    if (isBatch) {
      // TODO: use sortable.sorted
      config = (object as Batch<any>).children.map((instance: DisplayObject<any>) => {
        const [halfWidth, halfHeight] = this.getSize(instance.attributes, tagName);
        const fillColor = rgb2arr(instance.attributes.fill || '');
        return {
          size: [halfWidth + lineWidth / 2, halfHeight + lineWidth / 2],
          color: fillColor as [number, number, number, number], // sRGB
          opacity: fillOpacity,
          strokeOpacity,
          strokeColor: strokeColor as [number, number, number, number], // sRGB
        };
      });
    } else {
      const [halfWidth, halfHeight] = this.getSize(sceneGraphNode.attributes, tagName);
      config.push({
        size: [halfWidth + lineWidth / 2, halfHeight + lineWidth / 2],
        color: fillColor as [number, number, number, number], // sRGB
        opacity: fillOpacity,
        strokeOpacity,
        strokeColor: strokeColor as [number, number, number, number], // sRGB
      });
    }

    const attributes = this.buildAttributes(config);

    geometry.maxInstancedCount = attributes.instancedSizes.length / 2;
    // geometry.vertexCount = 6;

    geometry.setIndex([0, 1, 2, 0, 2, 3]);

    geometry.setAttribute(ATTRIBUTE.Extrude, Float32Array.from(attributes.extrudes), {
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

    geometry.setAttribute(ATTRIBUTE.Color, Float32Array.from(attributes.instancedColors), {
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

    geometry.setAttribute(ATTRIBUTE.Size, Float32Array.from(attributes.instancedSizes), {
      arrayStride: 4 * 2,
      stepMode: 'instance',
      attributes: [
        {
          shaderLocation: 3,
          offset: 0,
          format: 'float2',
        },
      ],
    });
  }

  private buildAttribute(
    config: Partial<IPointConfig>,
    attributes: IInstanceAttributes,
  ) {
    attributes.instancedColors.push(...(config.color || [1, 0, 0, 1]));
    attributes.instancedSizes.push(...(config.size || [0.2, 0.2]));
  }

  private buildAttributes(config: Array<Partial<IPointConfig>>) {
    const attributes: IInstanceAttributes = {
      extrudes: [1, 1, 1, -1, -1, -1, -1, 1],
      instancedColors: [],
      instancedSizes: [],
    };

    config.forEach((c) => {
      this.buildAttribute(c, attributes);
    });

    return attributes;
  }

  private getSize(attributes: CircleStyleProps, tagName: SHAPE) {
    if (tagName === SHAPE.Circle) {
      return [attributes.r, attributes.r];
    } else if (tagName === SHAPE.Ellipse) {
      return [attributes.rx, attributes.ry];
    } else if (tagName === SHAPE.Rect) {
      return [(attributes.width || 0) / 2, (attributes.height || 0) / 2];
    }
    return [0, 0];
  }
}
