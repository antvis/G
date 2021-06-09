import { DisplayObject, Renderable, ShapeAttrs } from '@antv/g';
import { inject, injectable } from 'inversify';
import { mat3, vec3 } from 'gl-matrix';
import {
  Material3D,
  Geometry3D,
  Renderable3D,
  ModelBuilder,
  ShaderModuleService,
  gl,
  rgb2arr,
} from '@antv/g-plugin-webgl-renderer';
import gridVertex from './shaders/webgl.grid.vert.glsl';
import gridFragment from './shaders/webgl.grid.frag.glsl';

const ATTRIBUTE = {
  Position: 'a_Position',
};

const UNIFORM = {
  Color1: 'u_GridColor',
  Color2: 'u_GridColor2',
  Size1: 'u_GridSize',
  Size2: 'u_GridSize2',
};

@injectable()
export class GridModelBuilder implements ModelBuilder {
  @inject(ShaderModuleService)
  private shaderModule: ShaderModuleService;

  async onAttributeChanged(object: DisplayObject, name: string, value: any) {
    const entity = object.getEntity();
    const renderable = entity.getComponent(Renderable);
    const renderable3d = entity.getComponent(Renderable3D);
  }

  async prepareModel(object: DisplayObject) {
    const entity = object.getEntity();
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);
    const renderable3d = entity.getComponent(Renderable3D);

    const { fill = '', height, width } = object.attributes;

    this.shaderModule.registerModule('grid', {
      vs: gridVertex,
      fs: gridFragment,
    });
    const { vs, fs, uniforms: extractedUniforms } = this.shaderModule.getModule('grid');

    material.vertexShaderGLSL = vs || '';
    material.fragmentShaderGLSL = fs || '';
    material.cull = {
      enable: false,
    };
    material.depth = {
      enable: false,
    };

    const fillColor = rgb2arr(fill);
    material.setUniform({
      ...(extractedUniforms as Record<string, BufferData>),
      [UNIFORM.Color1]: fillColor,
      [UNIFORM.Color2]: fillColor,
      [UNIFORM.Size1]: 10,
      [UNIFORM.Size2]: 10,
    });

    geometry.vertexCount = 6;
    geometry.setIndex([0, 3, 2, 2, 1, 0]);

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    geometry.setAttribute(
      ATTRIBUTE.Position,
      Float32Array.from([
        -halfWidth,
        0,
        -halfHeight,
        halfWidth,
        0,
        -halfHeight,
        halfWidth,
        0,
        halfHeight,
        -halfWidth,
        0,
        halfHeight,
      ]),
      {
        arrayStride: 4 * 3,
        stepMode: 'vertex',
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: 'float3',
          },
        ],
      },
    );
  }
}
