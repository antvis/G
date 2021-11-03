import { inject, injectable } from 'inversify';
import {
  Format,
  makeTextureDescriptor2D,
  MipFilterMode,
  TexFilterMode,
  VertexBufferFrequency,
  WrapMode,
} from '../platform';
import { RenderInst } from '../render/RenderInst';
import { DisplayObject, Image, Renderable, SHAPE } from '@antv/g';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch } from '.';
import { TextureMapping } from '../render/TextureHolder';
import { TexturePool } from '../TexturePool';

class ImageProgram extends DeviceProgram {
  static a_Size = Object.keys(Batch.AttributeLocation).length;
  static a_Uv = Object.keys(Batch.AttributeLocation).length + 1;

  static ub_ObjectParams = 1;

  both: string = `
  ${Batch.ShaderLibrary.BothDeclaration}
  `;

  vert: string = `
  ${Batch.ShaderLibrary.VertDeclaration}
  layout(location = ${ImageProgram.a_Size}) attribute vec2 a_Size;

  #ifdef USE_UV
    layout(location = ${ImageProgram.a_Uv}) attribute vec2 a_Uv;
    out vec2 v_Uv;
  #endif
  
  void main() {
    ${Batch.ShaderLibrary.Vert}

    vec2 offset = (a_Uv - a_Anchor) * a_Size;

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(offset, 0.0, 1.0);
    
    ${Batch.ShaderLibrary.UvVert}
  }
  `;

  frag: string = `

  ${Batch.ShaderLibrary.FragDeclaration}

  #ifdef USE_UV
    in vec2 v_Uv;
  #endif

  #ifdef USE_MAP
    uniform sampler2D u_Map;
  #endif
  
  void main() {
    ${Batch.ShaderLibrary.Frag}

    #ifdef USE_MAP
      vec4 texelColor = texture(SAMPLER_2D(u_Map), v_Uv);
    #endif

    gl_FragColor = texelColor;
    gl_FragColor.a = gl_FragColor.a * u_Opacity;
  }
  `;
}

@injectable()
export class ImageRenderer extends Batch {
  protected program = new ImageProgram();

  @inject(TexturePool)
  private texturePool: TexturePool;

  protected validate(object: DisplayObject<any, any>): boolean {
    const instance = this.objects[0];
    if (instance.nodeName === SHAPE.Image) {
      if (instance.parsedStyle.img !== object.parsedStyle.img) {
        return false;
      }
    }

    return true;
  }

  protected buildGeometry() {
    this.program.setDefineBool('USE_UV', true);
    this.program.setDefineBool('USE_MAP', true);

    const { img, width, height } = this.objects[0].parsedStyle;
    this.mapping = new TextureMapping();
    this.mapping.texture = this.texturePool.getOrCreateTexture(
      this.device,
      img,
      makeTextureDescriptor2D(Format.U8_RGBA_NORM, width, height, 1),
      () => {
        // need re-render
        this.objects.forEach((object) => {
          const renderable = object.entity.getComponent(Renderable);
          renderable.dirty = true;

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
            const renderable = object.entity.getComponent(Renderable);
            renderable.dirty = true;

            this.renderingService.dirtify();
          });
        },
      );
    }
  }

  protected uploadUBO(renderInst: RenderInst): void {
    // need 1 sampler
    renderInst.setBindingLayouts([{ numUniformBuffers: 2, numSamplers: 1 }]);
    renderInst.setSamplerBindingsFromTextureMappings([this.mapping]);
  }
}
