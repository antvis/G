import { DisplayObject, Renderable, SceneGraphNode } from '@antv/g';
import { inject, injectable } from 'inversify';
import { ShaderModuleService } from '../services/shader-module';
import imageVertex from './shaders/webgl.image.vert.glsl';
import imageFragment from './shaders/webgl.image.frag.glsl';
import { gl } from '../services/renderer/constants';
import { Material3D } from '../components/Material3D';
import { Geometry3D } from '../components/Geometry3D';
import { Renderable3D } from '../components/Renderable3D';
import { BufferData, RenderingEngine } from '../services/renderer';
import { TexturePool } from './TexturePool';
import { ModelBuilder } from '.';

interface IImageConfig {
  id: number;
  size: [number, number];
}

interface IInstanceAttributes {
  extrudes: number[];
  instancedSizes: number[];
}

const ATTRIBUTE = {
  Size: 'a_Size',
  Extrude: 'a_Extrude',
};

const UNIFORM = {
  Texture: 'u_Texture',
  Anchor: 'u_Anchor',
};

/**
 * Render image with texture2d
 */
@injectable()
export class ImageModelBuilder implements ModelBuilder {
  @inject(ShaderModuleService)
  private shaderModule: ShaderModuleService;

  @inject(TexturePool)
  private texturePool: TexturePool;

  async onAttributeChanged(object: DisplayObject, name: string, value: any) {
    const entity = object.getEntity();
    const renderable = entity.getComponent(Renderable);
    const renderable3d = entity.getComponent(Renderable3D);
    // if we are updating sub renderable's attribute
    if (renderable3d.sourceEntity) {
      //
    } else {
      const material = entity.getComponent(Material3D);
      const geometry = entity.getComponent(Geometry3D);

      const { img, width = 0, height = 0 } = object.attributes;
      if (name === 'img') {
        const texture = await this.loadImage(img, width, height, material, renderable3d.engine);
        material.setUniform({
          [UNIFORM.Texture]: texture,
        });
        renderable.dirty = true;
      } else if (name === 'width') {
        geometry.setAttribute(ATTRIBUTE.Size, Float32Array.from([value, height]));
      } else if (name === 'height') {
        geometry.setAttribute(ATTRIBUTE.Size, Float32Array.from([width, value]));
      } else if (name === 'anchor') {
        material.setUniform({
          [UNIFORM.Anchor]: value,
        });
      }
    }
  }

  async prepareModel(object: DisplayObject) {
    const entity = object.getEntity();
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);
    const renderable3d = entity.getComponent(Renderable3D);
    const instancing = renderable3d.instances.length > 0;

    const { width = 0, height = 0, img, anchor = [0, 0] } = object.attributes;

    this.shaderModule.registerModule('image', {
      vs: imageVertex,
      fs: imageFragment,
    });
    const { vs, fs, uniforms: extractedUniforms } = this.shaderModule.getModule('image');

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

    const texture = await this.loadImage(img, width, height, material, renderable3d.engine);

    material.setUniform({
      ...(extractedUniforms as Record<string, BufferData>),
      [UNIFORM.Texture]: texture,
      [UNIFORM.Anchor]: anchor,
    });

    let config: Partial<IImageConfig>[] = [];
    if (instancing) {
      config = renderable3d.instanceEntities.map((subEntity) => {
        const { attributes } = subEntity.getComponent(SceneGraphNode);
        return {
          size: [attributes.width || 0, attributes.height || 0],
        };
      });
    } else {
      config.push({
        size: [width, height],
      });
    }

    const attributes = this.buildAttributes(config);

    geometry.maxInstancedCount = attributes.instancedSizes.length / 2;
    geometry.vertexCount = 6;

    geometry.setIndex([0, 2, 1, 0, 3, 2]);

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

  private async loadImage(
    img: string | HTMLImageElement,
    width = 0,
    height = 0,
    material: Material3D,
    engine: RenderingEngine
  ) {
    material.dirty = true;

    // TODO: WebGL don't support mipmap in size of pow2
    const texture = await this.texturePool.getOrCreateTexture2D(engine, img, {
      width,
      height,
    });

    material.dirty = false;
    return texture;
  }
}
