import {
  Batch,
  Circle,
  Ellipse,
  Rect,
  CircleStyleProps,
  DisplayObject,
  DisplayObjectPool,
  ParsedCircleStyleProps,
  PARSED_COLOR_TYPE,
  SHAPE,
  Tuple4Number,
} from '@antv/g';
import { inject, injectable } from 'inversify';
import { ShaderModuleService } from '../services/shader-module';
// @ts-ignore
import circleVertex from './shaders/webgl.circle.vert.glsl';
// @ts-ignore
import circleFragment from './shaders/webgl.circle.frag.glsl';
import { gl } from '../services/renderer/constants';
import { Material3D } from '../components/Material3D';
import { Geometry3D } from '../components/Geometry3D';
import { Renderable3D } from '../components/Renderable3D';
import { BufferData } from '../services/renderer';
import { ModelBuilder } from '.';

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
  uvs: number[];
  instancedColors: number[];
  instancedSizes: number[];
}

const ATTRIBUTE = {
  Size: 'a_Size',
  Uv: 'a_Uv',
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

  onAttributeChanged(object: Circle | Ellipse | Rect, name: string, value: any) {
    const entity = object.getEntity();
    const renderable3d = entity.getComponent(Renderable3D);
    // if we are updating sub renderable's attribute
    if (renderable3d && renderable3d.source && renderable3d.sourceEntity) {
      const sourceGeometry = renderable3d.sourceEntity.getComponent(Geometry3D);
      // TODO: update subdata in this buffer
      // @ts-ignore
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
          // @ts-ignore
          r = 0,
          lineWidth = 0,
          // @ts-ignore
          rx = 0,
          // @ts-ignore
          ry = 0,
          // @ts-ignore
          width = 0,
          // @ts-ignore
          height = 0,
        } = object.parsedStyle;
        if (name === 'fill') {
          const fillColor = value.value;
          geometry.setAttribute(ATTRIBUTE.Color, Float32Array.from(fillColor));
        } else if (name === 'stroke') {
          const strokeColor = value.value;
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

  prepareModel(object: DisplayObject<CircleStyleProps, ParsedCircleStyleProps>) {
    const entity = object.getEntity();
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);

    // const isBatch = sceneGraphNode.tagName === Batch.tag;
    let tagName = object.nodeName;
    // if (isBatch) {
    //   tagName = (object as Batch).getBatchType()!;
    // }

    // const {
    //   fill = '',
    //   fillOpacity = 1,
    //   stroke = '',
    //   strokeOpacity = 1,
    //   lineWidth = 0,
    //   radius = 0,
    // } = isBatch
    //     ? ((object as Batch).children[0] as DisplayObject).attributes
    //     : object.parsedStyle;

    const {
      fill,
      opacity = 1,
      fillOpacity = 1,
      stroke,
      strokeOpacity = 1,
      lineWidth = 0,
      // @ts-ignore
      radius = 0,
    } = object.parsedStyle;

    let fillColor: Tuple4Number = [1, 1, 1, 1];
    let strokeColor: Tuple4Number = [0, 0, 0, 0];
    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      fillColor = fill.value;
    }
    if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
      strokeColor = stroke.value;
    }

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
      [UNIFORM.StrokeOpacity]: strokeOpacity * opacity,
      [UNIFORM.RectRadius]: radius,
      [UNIFORM.Anchor]: tagName === SHAPE.Rect ? [1, 1] : [0, 0],
    });

    let config: Partial<IPointConfig>[] = [];

    // if (isBatch) {
    //   // TODO: use sortable.sorted
    //   config = object.children.map((instance: DisplayObject) => {
    //     const [halfWidth, halfHeight] = this.getSize(instance.attributes, tagName);
    //     const fillColor = rgb2arr(instance.attributes.fill || '');
    //     return {
    //       size: [halfWidth + lineWidth / 2, halfHeight + lineWidth / 2],
    //       color: fillColor as [number, number, number, number], // sRGB
    //       opacity: fillOpacity,
    //       strokeOpacity,
    //       strokeColor: strokeColor as [number, number, number, number], // sRGB
    //     };
    //   });
    // } else {
    // @ts-ignore
    const [halfWidth, halfHeight] = this.getSize(object.attributes, tagName);
    config.push({
      size: [halfWidth + lineWidth / 2, halfHeight + lineWidth / 2],
      color: fillColor as [number, number, number, number], // sRGB
      opacity: fillOpacity * opacity,
      strokeOpacity,
      strokeColor: strokeColor as [number, number, number, number], // sRGB
    });
    // }

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

    geometry.setAttribute(ATTRIBUTE.Uv, Float32Array.from(attributes.uvs), {
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

  private buildAttribute(config: Partial<IPointConfig>, attributes: IInstanceAttributes) {
    attributes.instancedColors.push(...(config.color || [1, 0, 0, 1]));
    attributes.instancedSizes.push(...(config.size || [0.2, 0.2]));
  }

  private buildAttributes(config: Array<Partial<IPointConfig>>) {
    const attributes: IInstanceAttributes = {
      extrudes: [1, 1, 1, -1, -1, -1, -1, 1],
      uvs: [1, 1, 1, 0, 0, 0, 0, 1],
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
      // @ts-ignore
      return [attributes.rx, attributes.ry];
    } else if (tagName === SHAPE.Rect) {
      // @ts-ignore
      return [(attributes.width || 0) / 2, (attributes.height || 0) / 2];
    }
    return [0, 0];
  }
}
