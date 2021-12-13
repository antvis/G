import { injectable } from 'mana-syringe';
import { DisplayObject, Image, Renderable, SHAPE } from '@antv/g';
import {
  Format,
  makeTextureDescriptor2D,
  MipFilterMode,
  TexFilterMode,
  VertexBufferFrequency,
  WrapMode,
} from '../platform';
import { RenderInst } from '../render/RenderInst';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch, AttributeLocation } from './Batch';
import { ShapeRenderer } from '../tokens';
import { TextureMapping } from '../render/TextureHolder';
import { Mesh } from '../Mesh';

@injectable({
  token: [{ token: ShapeRenderer, named: Mesh.tag }],
})
export class MeshRenderer extends Batch {
  protected program = new DeviceProgram();

  protected validate(object: Mesh): boolean {
    if (this.instance.nodeName === Mesh.tag) {
      // Material 类型必须一致
      // if (this.instance.parsedStyle.img !== object.parsedStyle.img) {
      //   return false;
      // }
    }

    return true;
  }

  protected buildGeometry() {
    const instance = this.instance as Mesh;
    const { geometry, material } = instance.style;

    // construct geometry
    this.geometry = geometry;
    // attach device
    this.geometry.device = this.device;
    if (this.geometry.init) {
      this.geometry.init();
    }

    // set defines
    Object.keys(material.defines).forEach((key) => {
      const value = material.defines[key];
      if (typeof value === 'number') {
        this.program.setDefineString(key, `${value}`);
      } else {
        this.program.setDefineBool(key, value);
      }
    });

    // build shaders
    this.program.vert = material.vertexShader;
    this.program.frag = material.fragmentShader;

    // set texture mappings

    const { map } = this.instance.parsedStyle;

    if (map) {
      this.program.setDefineBool('USE_MAP', true);
      this.fillMapping = new TextureMapping();
      this.fillMapping.texture = this.texturePool.getOrCreateTexture(
        this.device,
        map,
        makeTextureDescriptor2D(Format.U8_RGBA_NORM, 1, 1, 1),
        () => {
          // need re-render
          this.objects.forEach((object) => {
            const renderable = object.renderable;
            renderable.dirty = true;

            this.renderingService.dirtify();
          });
        },
      );
      this.device.setResourceName(this.fillMapping.texture, 'Image Texture');
      this.fillMapping.sampler = this.renderHelper.getCache().createSampler({
        wrapS: WrapMode.Clamp,
        wrapT: WrapMode.Clamp,
        minFilter: TexFilterMode.Bilinear,
        magFilter: TexFilterMode.Bilinear,
        mipFilter: MipFilterMode.NoMip,
        minLOD: 0,
        maxLOD: 0,
      });
    } else {
      this.program.setDefineBool('USE_MAP', false);
    }
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    super.updateAttribute(object, name, value);

    const index = this.objects.indexOf(object);
    const geometry = this.geometry;
    // const image = object as Image;
    // const { width, height, img } = image.parsedStyle;

    // if (name === 'width' || name === 'height') {
    //   geometry.updateVertexBuffer(
    //     2,
    //     ImageProgram.a_Size,
    //     index,
    //     new Uint8Array(new Float32Array([width, height]).buffer),
    //   );
    // } else if (name === 'img') {
    //   this.mapping.texture = this.texturePool.getOrCreateTexture(
    //     this.device,
    //     img,
    //     makeTextureDescriptor2D(Format.U8_RGBA_NORM, width, height, 1),
    //     () => {
    //       // need re-render
    //       this.objects.forEach((object) => {
    //         object.renderable.dirty = true;

    //         this.renderingService.dirtify();
    //       });
    //     },
    //   );
    // }
  }

  protected uploadUBO(renderInst: RenderInst): void {
    // need 1 sampler
    renderInst.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 1 }]);
    renderInst.setSamplerBindingsFromTextureMappings([this.fillMapping]);
  }
}
