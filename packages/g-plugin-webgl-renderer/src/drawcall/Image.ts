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
import vert from '../shader/image.vert';
import frag from '../shader/image.frag';

class ImageProgram extends DeviceProgram {
  static a_Size = AttributeLocation.MAX;
  static a_Uv = AttributeLocation.MAX + 1;

  static ub_ObjectParams = 1;

  vert: string = vert;

  frag: string = frag;
}

@injectable({
  token: [{ token: ShapeRenderer, named: SHAPE.Image }],
})
export class ImageRenderer extends Batch {
  protected program = new ImageProgram();

  protected validate(object: DisplayObject<any, any>): boolean {
    if (this.instance.nodeName === SHAPE.Image) {
      if (this.instance.parsedStyle.img !== object.parsedStyle.img) {
        return false;
      }
    }

    return true;
  }

  protected buildGeometry() {
    this.program.setDefineBool('USE_UV', true);
    this.program.setDefineBool('USE_MAP', true);

    const { img, width, height } = this.instance.parsedStyle;
    this.mapping = new TextureMapping();
    this.mapping.texture = this.texturePool.getOrCreateTexture(
      this.device,
      img,
      makeTextureDescriptor2D(Format.U8_RGBA_NORM, width, height, 1),
      () => {
        // need re-render
        this.objects.forEach((object) => {
          object.renderable.dirty = true;

          this.renderingService.dirtify();
        });
      },
    );
    this.device.setResourceName(this.mapping.texture, 'Image Texture');
    this.mapping.sampler = this.renderHelper.getCache().createSampler({
      wrapS: WrapMode.Clamp,
      wrapT: WrapMode.Clamp,
      minFilter: TexFilterMode.Bilinear,
      magFilter: TexFilterMode.Bilinear,
      mipFilter: MipFilterMode.NoMip,
      minLOD: 0,
      maxLOD: 0,
    });

    const instanced = [];
    const interleaved = [];
    const indices = [];
    this.objects.forEach((object, i) => {
      const image = object as Image;
      const offset = i * 4;
      const { width, height } = image.parsedStyle;
      instanced.push(width, height);
      interleaved.push(0, 0, 1, 0, 1, 1, 0, 1);
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
          location: ImageProgram.a_Uv,
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
          location: ImageProgram.a_Size,
        },
      ],
      data: new Float32Array(instanced),
    });
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    super.updateAttribute(object, name, value);

    const index = this.objects.indexOf(object);
    const geometry = this.geometry;
    const image = object as Image;
    const { width, height, img } = image.parsedStyle;

    if (name === 'width' || name === 'height') {
      geometry.updateVertexBuffer(
        2,
        ImageProgram.a_Size,
        index,
        new Uint8Array(new Float32Array([width, height]).buffer),
      );
    } else if (name === 'img') {
      this.mapping.texture = this.texturePool.getOrCreateTexture(
        this.device,
        img,
        makeTextureDescriptor2D(Format.U8_RGBA_NORM, width, height, 1),
        () => {
          // need re-render
          this.objects.forEach((object) => {
            object.renderable.dirty = true;

            this.renderingService.dirtify();
          });
        },
      );
    }
  }

  protected uploadUBO(renderInst: RenderInst): void {
    // need 1 sampler
    renderInst.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 1 }]);
    renderInst.setSamplerBindingsFromTextureMappings([this.mapping]);
  }
}
